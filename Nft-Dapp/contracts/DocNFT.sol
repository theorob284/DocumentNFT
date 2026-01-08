// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/* Each NFT represents ownership of a unique document. The document self is stored off-chain.
 Only the hash of the original document is stored on-chain. */
contract DocumentNFT is ERC721 {

    struct DocumentRecord {
        bytes32 documentHash; // hash of the ORIGINAL document (before encryption)
        address issuer;       // address that certified / minted the document
        uint64 issuedAt;      // timestamp of certification
    }

    uint256 private nextTokenId = 1;

    // tokenId => document record
    mapping(uint256 => DocumentRecord) private records;
    // documentHash => already used
    mapping(bytes32 => bool) public hashUsed;

    constructor() ERC721("Certified Document", "DOCNFT") {}

    function mintDocument( /*Mint a new NFT document */
        address to, /*Owner of the NFT*/
        bytes32 documentHash /* Hash of original document */
    ) external returns (uint256 tokenId) {
        require(to != address(0), "Invalid recipient");
        require(documentHash != bytes32(0), "Invalid hash");
        require(!hashUsed[documentHash], "Document already certified");

        hashUsed[documentHash] = true;

        tokenId = nextTokenId++;
        _safeMint(to, tokenId);

        records[tokenId] = DocumentRecord({
            documentHash: documentHash,
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp)
        });
    }

    /*  Get document record for a token. */
    function getRecord(uint256 tokenId)
        external
        view
        returns (DocumentRecord memory)
    {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return records[tokenId];
    }

    /* Verify a document hash against the stored one. */
    function verifyHash(uint256 tokenId, bytes32 providedHash)
        external
        view
        returns (bool)
    {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return records[tokenId].documentHash == providedHash;
    }
}
