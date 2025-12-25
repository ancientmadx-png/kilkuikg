// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AcademicCredentials
 * @dev Soulbound Token (Non-transferable NFT) for academic credentials
 */
contract AcademicCredentials is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Credential {
        string ipfsHash;
        string degree;
        string institution;
        address student;
        uint256 issueDate;
        bool revoked;
    }

    mapping(uint256 => Credential) public credentials;
    mapping(address => bool) public authorizedInstitutions;
    mapping(address => uint256[]) public studentCredentials;

    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed student,
        string institution,
        string degree,
        string ipfsHash,
        uint256 issueDate
    );

    event CredentialRevoked(uint256 indexed tokenId);
    event InstitutionAuthorized(address indexed institution);
    event InstitutionRevoked(address indexed institution);

    constructor() ERC721("Academic Credential", "ACRED") Ownable(msg.sender) {}

    modifier onlyAuthorized() {
        require(
            authorizedInstitutions[msg.sender] || msg.sender == owner(),
            "Not authorized to issue credentials"
        );
        _;
    }

    /**
     * @dev Authorize an institution to issue credentials
     */
    function authorizeInstitution(address institution) external onlyOwner {
        authorizedInstitutions[institution] = true;
        emit InstitutionAuthorized(institution);
    }

    /**
     * @dev Revoke institution authorization
     */
    function revokeInstitutionAuth(address institution) external onlyOwner {
        authorizedInstitutions[institution] = false;
        emit InstitutionRevoked(institution);
    }

    /**
     * @dev Issue a new credential (Soulbound Token)
     */
    function issueCredential(
        address student,
        string memory ipfsHash,
        string memory degree,
        string memory institution
    ) external onlyAuthorized returns (uint256) {
        require(student != address(0), "Invalid student address");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bytes(degree).length > 0, "Degree required");
        require(bytes(institution).length > 0, "Institution required");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(student, tokenId);

        credentials[tokenId] = Credential({
            ipfsHash: ipfsHash,
            degree: degree,
            institution: institution,
            student: student,
            issueDate: block.timestamp,
            revoked: false
        });

        studentCredentials[student].push(tokenId);

        emit CredentialIssued(
            tokenId,
            student,
            institution,
            degree,
            ipfsHash,
            block.timestamp
        );

        return tokenId;
    }

    /**
     * @dev Revoke a credential
     */
    function revokeCredential(uint256 tokenId) external onlyAuthorized {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        credentials[tokenId].revoked = true;
        emit CredentialRevoked(tokenId);
    }

    /**
     * @dev Get credential metadata
     */
    function getCredentialMetadata(uint256 tokenId)
        external
        view
        returns (
            string memory ipfsHash,
            string memory degree,
            string memory institution,
            address student,
            uint256 issueDate,
            bool revoked
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Credential memory cred = credentials[tokenId];
        return (
            cred.ipfsHash,
            cred.degree,
            cred.institution,
            cred.student,
            cred.issueDate,
            cred.revoked
        );
    }

    /**
     * @dev Get all credentials for a student
     */
    function getStudentCredentials(address student)
        external
        view
        returns (uint256[] memory)
    {
        return studentCredentials[student];
    }

    /**
     * @dev Override transfer functions to make tokens non-transferable (Soulbound)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Token is non-transferable");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Disable approval functions for Soulbound tokens
     */
    function approve(address, uint256) public virtual override {
        revert("Soulbound: Token is non-transferable");
    }

    function setApprovalForAll(address, bool) public virtual override {
        revert("Soulbound: Token is non-transferable");
    }
}
