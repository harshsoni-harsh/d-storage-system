// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Provider.sol";
import "./Deal.sol";

contract Marketplace {
    mapping(address => address) public providers;

    event ProviderRegistered(address indexed provider);
    event DealCreated(address indexed userAddress, address indexed provider);
    event PaymentReleased(
        address indexed userAddress,
        address indexed provider
    );

    modifier onlyProvider(address _provider) {
        require(address(providers[_provider]) != address(0), "Not a registered provider");
        _;
    }

    function registerProvider(
        string memory _ipfsPeerId,
        uint256 _sectorCount,
        uint256 _pricePerKB
    ) external {
        require(address(providers[msg.sender]) == address(0), "Already registered");

        providers[msg.sender] = address(new Provider(
            _pricePerKB,
            _sectorCount,
            _ipfsPeerId
        ));

        emit ProviderRegistered(msg.sender);
    }

    function createDeal(
        address _provider,
        uint256 _fileSize,
        uint256 _duration
    ) external payable onlyProvider(_provider) {
        Provider provider = Provider(providers[_provider]);
        uint256 sectorCount = (_fileSize + 31) / 32;

        uint256 requiredPayment = sectorCount * provider.pricePerSector();
        require(msg.value == requiredPayment, "Incorrect payment amount");
        require(
            sectorCount <= provider.sectorCount(),
            "Insufficient provider storage"
        );

        uint256 validTill = block.timestamp + _duration;

        provider.createDeal(
            msg.sender,
            provider.pricePerSector(),
            sectorCount,
            validTill
        );

        provider.reserveSectors(msg.sender, sectorCount);

        emit DealCreated(msg.sender, _provider);
    }

    function releasePayment(address _providerAddress, address _userAddress) external {
        Provider provider = Provider(providers[_providerAddress]);
        Deal deal = Deal(provider.dealsMapped(_userAddress));

        require(!deal.completed(), "Payment already released");
        deal.completeDeal();

        uint256 amount = deal.pricePerSector() * deal.sectorCount();

        payable(_providerAddress).transfer(amount);

        provider.releaseSectors(_userAddress, deal.sectorCount());

        emit PaymentReleased(_userAddress, _providerAddress);
    }
}
