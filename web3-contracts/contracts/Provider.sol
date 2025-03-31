// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Deal.sol";

contract Provider {
    uint256 public pricePerSector;
    uint256 public sectorCount;
    uint256 public validTill;
    string public ipfsPeerId;
    bool public exists;

    address[] deals;
    
    mapping(address => address) public dealsMapped;
    mapping(address => uint256) public reservedSectors;

    event StorageReserved(address userAddress, uint256 sectorCount);
    event StorageReleased(address userAddress, uint256 sectorCount);

    constructor(
        uint256 _pricePerSector,
        uint256 _sectorCount,
        string memory _ipfsPeer
    ) {
        pricePerSector = _pricePerSector;
        sectorCount = _sectorCount;
        validTill = 1 days;
        ipfsPeerId = _ipfsPeer;
        exists = true;
    }

    function updateData(
        uint256 newPrice,
        uint256 time,
        uint256 sectors
    ) public {
        pricePerSector = newPrice;
        validTill = time;
        sectorCount = sectors;
    }

    function createDeal(
        address _userAddress,
        uint256 _pricePerSector,
        uint256 _sectorCount,
        uint256 _validTill
    ) public {
        require(address(dealsMapped[_userAddress]) == address(0), "A deal already exists");

        Deal deal = new Deal(
            _userAddress,
            _pricePerSector,
            _sectorCount,
            _validTill
        );
        deals.push(address(deal));
        dealsMapped[_userAddress] = address(deal);
    }

    function isDealActive(address userAddress) public view returns (bool) {
        address dealAddress = dealsMapped[userAddress];

        require(dealAddress != address(0), "Deal does not exist");

        return Deal(dealAddress).validTill() > block.timestamp;
    }

    function reserveSectors(address userAddress, uint256 _sectorCount) public {
        require(_sectorCount <= sectorCount, "Not enough sectors");

        sectorCount -= _sectorCount;
        reservedSectors[userAddress] = _sectorCount;
        emit StorageReserved(userAddress, _sectorCount);
    }

    function releaseSectors(address userAddress, uint256 _sectorCount) public {
        require(reservedSectors[userAddress] >= _sectorCount, "Invalid release");

        sectorCount += _sectorCount;
        reservedSectors[userAddress] -= _sectorCount;

        emit StorageReleased(userAddress, _sectorCount);
    }
}
