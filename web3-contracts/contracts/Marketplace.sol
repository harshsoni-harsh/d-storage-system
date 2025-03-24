// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

contract StorageMarketplace {
    // Provider Structure
    struct Provider {
        string ipfsPeerId;
        uint256 availableStorage; // in KB
        uint256 pricePerKB; // in wei
        bool exists;
    }

    // Storage Agreement Structure
    struct StorageAgreement {
        address user;
        address provider;
        string cid;
        uint256 fileSize; // in KB
        uint256 duration; // in seconds
        uint256 amountPaid;
        uint256 endTime;
        bool completed;
    }

    // Mappings
    mapping(address => Provider) public providers;
    mapping(uint256 => StorageAgreement) public agreements;
    uint256 public agreementCount;

    // Events
    event ProviderRegistered(address indexed provider);
    event AgreementCreated(uint256 indexed agreementId, address indexed user);
    event PaymentReleased(
        uint256 indexed agreementId,
        address indexed provider
    );

    // Modifier to check if provider exists
    modifier onlyProvider(address _provider) {
        require(providers[_provider].exists, "Not a registered provider");
        _;
    }

    // Provider Registration Function
    function registerProvider(
        string memory _ipfsPeerId,
        uint256 _availableStorage,
        uint256 _pricePerKB
    ) external {
        require(!providers[msg.sender].exists, "Already registered");

        providers[msg.sender] = Provider({
            ipfsPeerId: _ipfsPeerId,
            availableStorage: _availableStorage,
            pricePerKB: _pricePerKB,
            exists: true
        });

        emit ProviderRegistered(msg.sender);
    }

    // Create Storage Agreement Function (Payable)
    function createAgreement(
        address _provider,
        string memory _cid,
        uint256 _fileSize,
        uint256 _duration
    ) external payable onlyProvider(_provider) {
        Provider storage provider = providers[_provider];

        uint256 requiredPayment = _fileSize * provider.pricePerKB;
        require(msg.value == requiredPayment, "Incorrect payment amount");
        require(
            _fileSize <= provider.availableStorage,
            "Insufficient provider storage"
        );

        agreements[agreementCount++] = StorageAgreement({
            user: msg.sender,
            provider: _provider,
            cid: _cid,
            fileSize: _fileSize,
            duration: _duration,
            amountPaid: msg.value,
            endTime: block.timestamp + _duration,
            completed: false
        });

        provider.availableStorage -= _fileSize;

        emit AgreementCreated(agreementCount, msg.sender);
    }

    // Release Payment Function
    function releasePayment(uint256 _agreementId) external {
        StorageAgreement storage agreement = agreements[_agreementId];
        require(!agreement.completed, "Payment already released");
        require(
            block.timestamp >= agreement.endTime,
            "Agreement duration not ended"
        );

        agreement.completed = true;
        payable(agreement.provider).transfer(agreement.amountPaid);

        // Restore provider's available storage
        providers[agreement.provider].availableStorage += agreement.fileSize;

        emit PaymentReleased(_agreementId, agreement.provider);
    }
}