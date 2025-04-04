// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Provider.sol";
import "./Deal.sol";
import "hardhat/console.sol";

contract Marketplace {
    // providerInstance[]
    address[] public providerList;

    // providerAddress -> providerInstance
    mapping(address => address) public provider_instances;

    // userAddress -> provider -> bool
    mapping(address => mapping(address => bool)) private user_deals;

    // userAddress -> providerInstance[]
    mapping(address => address[]) private userDealProviders;

    event ProviderRegistered(address indexed providerAddress, address indexed providerInstance);
    event DealCreated(address indexed userAddress, address indexed provider);
    event PaymentReleased(
        address indexed userAddress,
        address indexed provider
    );

    modifier onlyProvider(address _provider) {
        require(address(provider_instances[_provider]) != address(0), "Not a registered provider");
        _;
    }

    function getAllProviders() external view returns (address[] memory) {
        return providerList;
    }

    function getUserDeals() external view returns (address[] memory) {
        return userDealProviders[msg.sender];
    }


    function registerProvider(
        string memory _ipfsPeerId,
        uint256 _sectorCount,
        uint256 _pricePerSector
    ) external {
        require(address(provider_instances[msg.sender]) == address(0), "Already registered");

        address providerInstance = address(new Provider(
            msg.sender,
            _pricePerSector,
            _sectorCount,
            _ipfsPeerId
        ));
        provider_instances[msg.sender] = providerInstance;
        providerList.push(providerInstance);

        emit ProviderRegistered(msg.sender, providerInstance);
    }

    function initiateDeal(
        address _provider,
        uint256 _sectorCount,
        uint256 _duration
    ) external payable {
        require(provider_instances[msg.sender] == address(0), "Provider cannot initiate a deal.");
        require(!user_deals[msg.sender][_provider], "Deal already exists with this provider.");
        Provider provider = Provider(provider_instances[_provider]);
        
        uint256 validTill = block.timestamp + _duration;
        uint256 requiredPayment = _sectorCount * provider.pricePerSector();

        require(msg.value >= requiredPayment, string(abi.encodePacked("Incorrect payment amount. Required payment is ", requiredPayment)));
        require(
            _sectorCount <= provider.sectorCount(),
            "Insufficient provider storage"
        );

        provider.initiateDeal(
            msg.sender,
            provider.pricePerSector(),
            _sectorCount,
            validTill
        );

        user_deals[msg.sender][_provider] = true;
        userDealProviders[msg.sender].push(address(provider));

        provider.reserveSectors(msg.sender, _sectorCount);

        emit DealCreated(msg.sender, _provider);
    }

    function releasePayment(address _providerAddress, address _userAddress) external {
        Provider provider = Provider(provider_instances[_providerAddress]);
        address dealAddress = provider.dealsMapped(_userAddress);
        Deal deal = Deal(dealAddress);

        require(deal.isActive(), "Deal not active yet!");
        require(!deal.completed(), "Payment already released");
        deal.completeDeal();

        uint256 amount = deal.pricePerSector() * deal.sectorCount();

        payable(_providerAddress).transfer(amount);

        provider.releaseSectors(_userAddress, deal.sectorCount());

        emit PaymentReleased(_userAddress, _providerAddress);
    }
}
