// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

contract Deal {
    address public userAddress;
    uint256 public pricePerSector;
    uint256 public sectorCount;
    uint256 public validTill;
    bool public completed;
    address public marketplace;

    constructor(
        address _userAddress,
        uint256 _pricePerSector,
        uint256 _sectorCount,
        uint256 _validTill
    ) {
        userAddress = _userAddress;
        pricePerSector = _pricePerSector;
        sectorCount = _sectorCount;
        validTill = _validTill;
        marketplace = msg.sender;        
    }

    function completeDeal() external {
        require(msg.sender == marketplace, "Only marketplace can call the deal");
        require(block.timestamp >= validTill, "Deal duration not ended");
        completed = true;
    }
}
