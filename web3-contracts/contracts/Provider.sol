// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Deal.sol";

contract Provider {
    address public walletAddress;
    uint256 public pricePerSector;
    uint256 public sectorCount;
    uint256 public validTill;
    string public ipfsPeerId;
    bool public exists;
    address marketplace;

    uint256 public dealCount;

    address[] public deals;
    
    mapping(address => address) public dealsMapped;
    mapping(address => uint256) public reservedSectors;

    event StorageReserved(address userAddress, uint256 sectorCount);
    event StorageReleased(address userAddress, uint256 sectorCount);

    constructor(
        address _walletAddress,
        uint256 _pricePerSector,
        uint256 _sectorCount,
        string memory _ipfsPeer
    ) {
        walletAddress = _walletAddress;
        pricePerSector = _pricePerSector;
        sectorCount = _sectorCount;
        validTill = block.timestamp + 1 days;
        ipfsPeerId = _ipfsPeer;
        exists = true;
        marketplace = msg.sender;
    }

    function getAllDeals() external view returns (address[] memory) {
        return deals;
    }

    function updateData(
        uint256 newPrice,
        uint256 time,
        uint256 sectors
    ) public {
        require(msg.sender == walletAddress, "Only marketplace can initiate the deal");
        pricePerSector = newPrice;
        validTill = time;
        sectorCount = sectors;
    }

    function initiateDeal(
        address _userAddress,
        uint256 _pricePerSector,
        uint256 _sectorCount,
        uint256 _validTill
    ) public payable returns (address) {
        require(msg.sender == marketplace, "Only marketplace can initiate the deal");
        require(address(dealsMapped[_userAddress]) == address(0), "A deal already exists");
        Deal deal = new Deal(
            _userAddress,
            _pricePerSector,
            _sectorCount,
            _validTill,
            marketplace
        );
        dealsMapped[_userAddress] = address(deal);
        deals.push(address(deal));
        return address(deal);
    }

    function approveDeal(
        address _userAddress
    ) external payable {
        address dealAddress = dealsMapped[_userAddress];
        
        require(dealAddress != address(0), "Deal doesn't exists");
        require(msg.sender == walletAddress, "Only provider can approve the deal");
        
        Deal deal = Deal(dealAddress);
        require(!deal.isActive(), "Deal already approved");

        deal.activateDeal();
    }

    function isDealActive(address _userAddress) public view returns (bool) {
        address dealAddress = dealsMapped[_userAddress];

        require(dealAddress != address(0), "Deal does not exist");

        return Deal(dealAddress).validTill() > block.timestamp;
    }

    function reserveSectors(address userAddress, uint256 _sectorCount) public {
        require(_sectorCount <= sectorCount, "Not enough sectors");

        sectorCount -= _sectorCount;
        reservedSectors[userAddress] += _sectorCount;
        emit StorageReserved(userAddress, _sectorCount);
    }

    function releaseSectors(address userAddress, uint256 _sectorCount) public {
        require(reservedSectors[userAddress] >= _sectorCount, "Invalid release");

        sectorCount += _sectorCount;
        reservedSectors[userAddress] -= _sectorCount;

        emit StorageReleased(userAddress, _sectorCount);
    }
}
