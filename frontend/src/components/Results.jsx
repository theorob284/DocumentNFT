import React from "react";

export default function ResultPanel({ result }) {
  if (!result) return null;

  return (
    <div style={{ marginTop: 18 }}>
      <h3>Result</h3>
      <div><b>tokenId:</b> <code>{result.tokenId}</code></div>
      <div><b>docHash (bytes32):</b> <code>{result.docHash}</code></div>
      <div><b>IPFS CID (encrypted file):</b> <code>{result.cid}</code></div>
      <div><b>IV:</b> <code>{result.ivHex}</code></div>
      <div><b>Key (demo only):</b> <code>{result.keyHex}</code></div>
      <div style={{ marginTop: 8 }}>
        <b>Encrypted gateway URL:</b>
        <div><code>{`https://gateway.pinata.cloud/ipfs/${result.cid}`}</code></div>
      </div>
    </div>
  );
}
