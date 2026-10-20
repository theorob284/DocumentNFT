# PDF Minter

A decentralised web application for certifying documents using NFTs on the Ethereum blockchain. Documents are stored off-chain using IPFS, while ERC-721 tokens provide an on-chain record associated with each certified document.

This was a university team project developed by a group of four. I led the team and contributed to the implementation of document certification, ownership transfer, blockchain-based verification and retrieval of document records.

## Features

- **Document certification:** Mint an ERC-721 NFT associated with a document.
- **Decentralised file storage:** Store document files on IPFS rather than directly on the blockchain.
- **Ownership transfer:** Transfer ownership of certified document NFTs.
- **Verification:** Check document certification records through the blockchain.
- **Document retrieval:** Retrieve records associated with certified documents.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, JavaScript |
| Smart contracts | Solidity, ERC-721, OpenZeppelin |
| Blockchain development | Ethereum, Hardhat, Ethers.js |
| Decentralised storage | IPFS / Pinata |
| Development tooling | Node.js, MetaMask |

## How It Works

1. A user selects a document to certify through the web application.
2. The document is stored off-chain on IPFS.
3. An ERC-721 NFT is minted on Ethereum to represent the document's certification record.
4. The application's blockchain features support verification of the record and transfer of NFT ownership.
5. Document records can be retrieved through the application.

## My Contribution

I led a four-person development team and worked on implementing the application's main features, including document certification, ownership transfer, blockchain verification and record retrieval.

## Project Context

This project was built to explore how blockchain smart contracts and decentralised storage could be used together for document certification. It provided practical experience with full-stack development, Solidity smart contracts and integrating a React interface with Ethereum-based functionality.

## Running Locally

Setup instructions depend on the configuration and scripts included in this repository. Refer to the project's `package.json` files and Hardhat configuration for the exact installation, deployment and startup commands.

> **Note:** This is a university project and a technical demonstration, not a production-grade document authentication service. Minting an NFT provides an on-chain record but does not, by itself, establish the legal authenticity of a document.
