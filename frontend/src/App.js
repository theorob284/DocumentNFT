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

// Update this whenever you redeploy (or switch to env var later)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function App() {
  const { account, connectWallet } = useWallet();
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

      const to = recipient?.trim() ? recipient.trim() : account;
      if (!ethers.isAddress(to)) throw new Error("Invalid recipient address");

      setStatus("Reading file...");
      const originalBuffer = await file.arrayBuffer();

      setStatus("Hashing (SHA-256 of original)...");
      const docHash = await sha256Hex(originalBuffer);

      setStatus("Encrypting (AES-GCM)...");
      const { ciphertext, iv, rawKey } = await encryptAESGCM(originalBuffer);

      setStatus("Uploading encrypted file to IPFS (via backend)...");
      const { cid } = await uploadEncryptedToBackend(ciphertext, file.name + ".enc");

      setStatus("Minting NFT on-chain (MetaMask will prompt)...");
      const tokenId = await mintDocument(to, docHash);

      setStatus("Saving off-chain metadata (localStorage)...");
      const stored = {
        tokenId,
        owner: to,
        filename: file.name,
        cid,
        docHash,
        ivHex: bytesToHex(iv),
        keyHex: bytesToHex(rawKey), // DEMO ONLY
        createdAt: new Date().toISOString(),
      };
      saveDocRecord(tokenId, stored);

      setResult(stored);
      setStatus(`Done ✅ Minted tokenId=${tokenId}`);
    } catch (e) {
      console.error(e);
      setStatus(`Error: ${e?.message || e}`);
      alert(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 900 }}>
      <h2>Document DApp: Hash + Encrypt + IPFS + Mint NFT</h2>

      <WalletBar
        account={account}
        onConnect={async () => {
          try {
            await connectWallet();
          } catch (e) {
            alert(e?.message || "Failed to connect wallet");
          }
        }}
      />

      <DocumentForm account={account} onProcess={onProcess} busy={busy} />

      <p style={{ marginTop: 12 }}>
        <b>Status:</b> {status}
      </p>

      <ResultPanel result={result} />
    </div>
  );
}
