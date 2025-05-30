// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

contract Deal {
    address public userAddress;
    address public providerAddress;
    uint256 public pricePerSector;
    uint256 public sectorCount;
    uint256 public validTill;
    bool public isActive;
    bool public completed;
    address public marketplace;

    string[] public fileCIDs;

    event CIDAdded(string cid);

    constructor(
        address _userAddress,
        uint256 _pricePerSector,
        uint256 _sectorCount,
        uint256 _validTill,
        address _marketplaceAddress
    ) {
        userAddress = _userAddress;
        providerAddress = msg.sender;
        pricePerSector = _pricePerSector;
        sectorCount = _sectorCount;
        validTill = _validTill;
        marketplace = _marketplaceAddress;        
    }

    function activateDeal() public {
        require(msg.sender == providerAddress, "Only provider can approve the deal");
        require(isActive != true, "Deal is already active");
        isActive = true;
    }

    function completeDeal() external {
        require(msg.sender == marketplace, "Only marketplace can call the deal");
        // require(block.timestamp >= validTill, "Deal duration not ended");
        require(completed != true, "Deal is already completed");
        completed = true;
    }

    function getDealInfo() external view returns (
        address _userAddress,
        address _providerAddress,
        uint256 _pricePerSector,
        uint256 _sectorCount,
        uint256 _validTill,
        bool _isActive,
        bool _completed
    ) {
        return (userAddress, providerAddress, pricePerSector, sectorCount, validTill, isActive, completed);
    }

    function addCID(string memory cid) external {
        require(msg.sender == userAddress, "Only user can add CIDs");
        fileCIDs.push(cid);
        emit CIDAdded(cid);
    }

    function getAllCIDs() external view returns (string[] memory) {
        return fileCIDs;
    }
}
