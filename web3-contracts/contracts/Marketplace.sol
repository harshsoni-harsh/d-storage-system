// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Provider.sol";
import "./Deal.sol";

contract Marketplace {
    // providerInstance[]
    address[] providerList;

    // providerAddress -> providerInstance
    mapping(address => address) public provider_instances;

    // userAddress -> providerInstances[]
    mapping(address => address[]) user_providers;

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

    function getProviderList() public view returns (address[] memory) {
        return providerList;
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
        require(address(provider_instances[msg.sender]) == address(0), "Provider cannot initiate a deal.");
        Provider provider = Provider(provider_instances[_provider]);
        
        uint256 sectorCount = _sectorCount;
        uint256 validTill = block.timestamp + _duration;
        uint256 requiredPayment = sectorCount * provider.pricePerSector();

        require(msg.value == requiredPayment, "Incorrect payment amount");
        require(
            sectorCount <= provider.sectorCount(),
            "Insufficient provider storage"
        );

        provider.initiateDeal(
            msg.sender,
            provider.pricePerSector(),
            sectorCount,
            validTill
        );

        provider.reserveSectors(msg.sender, sectorCount);

        emit DealCreated(msg.sender, _provider);
    }

    function releasePayment(address _providerAddress, address _userAddress) external {
        Provider provider = Provider(provider_instances[_providerAddress]);
        uint256 dealIdx = provider.dealsMapped(_userAddress);
        address dealAddress = provider.deals(dealIdx);
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
