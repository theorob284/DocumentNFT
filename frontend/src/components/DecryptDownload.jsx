import React, { useState } from "react";
import { fetchFromIpfs } from "../services/ipfsFetch";
import { decryptAESGCM, hexToBytes } from "../crypto";

// Very important for decrypting the uploaded documents
export default function DecryptDownload() {
  const [cid, setCid] = useState(""); // all of these are used to get and decrypt document as seen on the webpage
  const [keyHex, setKeyHex] = useState("");
  const [ivHex, setIvHex] = useState("");
  const [filename, setFilename] = useState("decrypted.pdf");
  const [status, setStatus] = useState("");

  async function handleDecryptDownload() {
    try {
      setStatus("");

      // get cid, key and iv
      const c = cid.trim();
      const k = keyHex.trim();
      const v = ivHex.trim();
      const name = filename.trim() || "decrypted.pdf"; // placeholder filename
    
      // ensure all are provided
      if (!c) throw new Error("CID is required");
      if (!k) throw new Error("Key (hex) is required");
      if (!v) throw new Error("IV (hex) is required");

      setStatus("Downloading encrypted file from IPFS..."); // retrieving file from pinata
      const cipherBuf = await fetchFromIpfs(c);

      setStatus("Decrypting..."); // decrypting it with key and iv
      const keyBytes = hexToBytes(k);
      const ivBytes = hexToBytes(v);

      const plainBuf = await decryptAESGCM(cipherBuf, ivBytes, keyBytes); // decryption

      setStatus("Preparing download...");
      const blob = new Blob([plainBuf], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Done ✅ Download started");
    } catch (e) {console.error(e);setStatus(`Error: ${e?.message || e}`);}
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2>Decrypt & Download</h2>
      <p className="small">Paste the CID (encrypted file) plus the AES-GCM key and IV (hex). The file is decrypted locally and downloaded.</p>

      <div className="field">
        <div className="label">CID</div>
        <input className="input"value={cid}onChange={(e) => setCid(e.target.value)}placeholder="bafy..."/>
      </div>

      <div className="field">
        <div className="label">Key (hex)</div>
        <input className="input" value={keyHex} onChange={(e) => setKeyHex(e.target.value)}placeholder="0x..."/>
      </div>

      <div className="field">
        <div className="label">IV (hex)</div>
        <input className="input" value={ivHex} onChange={(e) => setIvHex(e.target.value)} placeholder="0x..."/>
      </div>

      <div className="field">
        <div className="label">Download filename</div>
        <input className="input" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="decrypted.pdf"/>
      </div>

      <button className="btn" onClick={handleDecryptDownload}> Decrypt & Download </button>

      <div className="status"> <b>Status:</b> {status || "—"} </div>
    </div>
  );
}
