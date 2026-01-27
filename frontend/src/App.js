import "./App.css";
import React, { useState } from "react";
import { ethers } from "ethers";

import { sha256Hex, encryptAESGCM, bytesToHex } from "./crypto";
import { uploadEncryptedToBackend } from "./services/ipfsUpload";
import { saveDocRecord } from "./services/StoreDocument";
import { useWallet } from "./hooks/useWallet";
import { useDocumentNFT } from "./hooks/UseDocNFT";

import WalletBar from "./components/walletBar";
import DocumentForm from "./components/Documentform";
import ResultPanel from "./components/Results";
import DecryptDownload from "./components/DecryptDownload";

// Update this whenever redeployed (or switch to env var later)
const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export default function App() {
  const { account, connectWallet } = useWallet(); // initialises states
  const { mintDocument } = useDocumentNFT(CONTRACT_ADDRESS);

  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onProcess({ file, recipient }) {
    try {
      if (!account) throw new Error("Connect MetaMask first");
      if (!file) throw new Error("Select a file first");
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.includes("PASTE_")) {
        throw new Error("Set CONTRACT_ADDRESS in App.js");
      }

      setBusy(true);
      setResult(null);

      const to = recipient?.trim() ? recipient.trim() : account; // to the recipient, either at choses address or by default, the person uploading document
      if (!ethers.isAddress(to)) throw new Error("Invalid recipient address");

      setStatus("Reading file...");
      const originalBuffer = await file.arrayBuffer(); // upload file

      setStatus("Hashing (SHA-256 of original)..."); // hash file
      const docHash = await sha256Hex(originalBuffer);

      setStatus("Encrypting (AES-GCM)..."); // encrypt file
      const { ciphertext, iv, rawKey } = await encryptAESGCM(originalBuffer);

      setStatus("Uploading encrypted file to IPFS (via backend)..."); // upload file to ipfs server
      const { cid } = await uploadEncryptedToBackend(ciphertext, file.name + ".enc");

      setStatus("Minting NFT on-chain (MetaMask will prompt)..."); // mint the file
      const tokenId = await mintDocument(to, docHash);

      setStatus("Saving off-chain metadata (localStorage)..."); // save metadata
      const stored = { 
        tokenId,
        owner: to,
        filename: file.name,
        cid,
        docHash,
        ivHex: bytesToHex(iv),
        keyHex: bytesToHex(rawKey), // this is for demo purposes
        createdAt: new Date().toISOString(),
      };
      // save record of document
      saveDocRecord(tokenId, stored);
      setResult(stored);
      setStatus(`Done ✅ Minted tokenId=${tokenId}`);
    } catch (e) {console.error(e); setStatus(`Error: ${e?.message || e}`); alert(e?.message || "Something went wrong");
    } finally {setBusy(false);}
  }

  return (
  <div className="container">
    <div className="header">
      <h1>Document NFT DApp</h1>
      <p>Upload a document → hash it → encrypt it → store on IPFS → mint ownership as an NFT.</p>
    </div>

    <WalletBar account={account} onConnect={connectWallet} />

    <div className="grid">
      <div className="card">
        <h2>Upload & Mint</h2>
        <DocumentForm account={account} onProcess={onProcess} busy={busy} />
        <div className="status"> <b>Status:</b> {status}</div>
      </div>

      <div className="card">
        <ResultPanel result={result} />
        <p className="small">(Demo) Encryption key is stored locally. In real systems, the keys would be protect properly.</p>
      </div>
      <div className="card"> <DecryptDownload /> </div>
      
    </div>
  </div>
);

}
