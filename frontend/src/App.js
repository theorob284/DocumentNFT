import React, { useState } from "react";
import { ethers } from "ethers";

import DocumentNFTArtifact from "./abi/DocNFT.json";
import { sha256Hex, encryptAESGCM, bytesToHex } from "./crypto";

// TODO: paste your deployed localhost contract address here
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = DocumentNFTArtifact.abi;

export default function App() {
  const [account, setAccount] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [file, setFile] = useState(null);

  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found. Please install MetaMask.");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to connect wallet");
    }
  }

  async function uploadEncryptedToBackend(ciphertext, filename) {
    const form = new FormData();
    form.append("file", new Blob([ciphertext]), filename);

    const res = await fetch("http://localhost:3001/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${text}`);
    }

    return res.json(); // { cid }
  }

  async function ensureHardhatNetwork() {
    if (!window.ethereum) throw new Error("MetaMask not found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    // Hardhat local chainId = 31337
    if (network.chainId !== 31337n) {
      alert(
        `Wrong network detected (chainId=${network.chainId}).\n\n` +
        `Please switch MetaMask to the Hardhat Local network (chainId 31337).`
      );
      throw new Error("Wrong network");
    }
  }


  async function mintDocument(to, docHash) {
    if (!window.ethereum) throw new Error("MetaMask not found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const tx = await contract.mintDocument(to, docHash);
    const receipt = await tx.wait();

    const iface = new ethers.Interface(ABI);
    const transferTopic = iface.getEvent("Transfer").topicHash;

    const log = receipt.logs.find(
      (l) =>
        l.address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
        l.topics?.[0] === transferTopic
    );

    if (!log) {
      // Fallback: query the event from the chain for this tx's block
      const events = await contract.queryFilter(
        contract.filters.Transfer(null, to),
        receipt.blockNumber,
        receipt.blockNumber
      );
      const ev = events[events.length - 1];
      if (!ev) throw new Error("Transfer event not found (log + queryFilter failed)");
      return ev.args.tokenId.toString();
    }

    const decoded = iface.decodeEventLog("Transfer", log.data, log.topics);
    return decoded.tokenId.toString();
  }


  async function handleProcessUploadMint() {
    try {
      if (!file) {
        alert("Please choose a file first.");
        return;
      }
      if (!account) {
        alert("Please connect MetaMask first.");
        return;
      }
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.includes("PASTE_")) {
        alert("Please set CONTRACT_ADDRESS in App.js to your deployed contract address.");
        return;
      }

      const to = recipient?.trim() ? recipient.trim() : account;

      setStatus("Reading file...");
      const originalBuffer = await file.arrayBuffer();

      setStatus("Hashing (SHA-256 of original)...");
      const docHash = await sha256Hex(originalBuffer); // bytes32 hex string

      setStatus("Encrypting (AES-GCM)...");
      const { ciphertext, iv, rawKey } = await encryptAESGCM(originalBuffer);

      setStatus("Uploading encrypted file to IPFS (via backend)...");
      const { cid } = await uploadEncryptedToBackend(ciphertext, file.name + ".enc");

      setStatus("Minting NFT on-chain (MetaMask will prompt)...");
      await ensureHardhatNetwork();
      const tokenId = await mintDocument(to, docHash);

      setStatus("Saving off-chain metadata (localStorage)...");
      const stored = {
        tokenId,
        owner: to,
        filename: file.name,
        cid, // encrypted content
        docHash,
        ivHex: bytesToHex(iv),
        keyHex: bytesToHex(rawKey), // DEMO ONLY (don't do this in production)
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`doc:${tokenId}`, JSON.stringify(stored));

      setResult(stored);
      setStatus(`Done ✅ Minted tokenId=${tokenId}`);
    } catch (e) {
      console.error(e);
      setStatus(`Error: ${e?.message || e}`);
      alert(e?.message || "Something went wrong");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 900 }}>
      <h2>Document DApp: Hash + Encrypt + IPFS + Mint NFT</h2>

      <div style={{ marginBottom: 16 }}>
        <button onClick={connectWallet}>
          {account
            ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect MetaMask"}
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Recipient address (optional — defaults to connected wallet)
        </label>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Choose a document</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <button onClick={handleProcessUploadMint} disabled={!file || !account}>
        Process → Upload → Mint
      </button>

      <p style={{ marginTop: 12 }}>
        <b>Status:</b> {status}
      </p>

      {result && (
        <div style={{ marginTop: 18 }}>
          <h3>Result</h3>
          <div>
            <b>tokenId:</b> <code>{result.tokenId}</code>
          </div>
          <div>
            <b>docHash (bytes32):</b> <code>{result.docHash}</code>
          </div>
          <div>
            <b>IPFS CID (encrypted file):</b> <code>{result.cid}</code>
          </div>
          <div>
            <b>IV:</b> <code>{result.ivHex}</code>
          </div>
          <div>
            <b>Key (demo only):</b> <code>{result.keyHex}</code>
          </div>
          <div style={{ marginTop: 8 }}>
            <b>Encrypted gateway URL:</b>
            <div>
              <code>{`https://gateway.pinata.cloud/ipfs/${result.cid}`}</code>
            </div>
          </div>

          <p style={{ marginTop: 10, fontSize: 13 }}>
            Note: This stores the encryption key in localStorage for demo purposes.
            In a real system, you’d protect the key (e.g., encrypt it to the owner).
          </p>
        </div>
      )}
    </div>
  );
}
