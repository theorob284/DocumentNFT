import React from "react";

// This just prints the results
export default function ResultPanel({ result }) {
  if (!result) return null; // safety check in case of no results
  return (
    <div style={{ marginTop: 18 }}>
      <h3>Result</h3>
      <div className="mono"><b>tokenId:</b> <code>{result.tokenId}</code></div>
      <br></br>
      <div className="mono"><b>docHash (bytes32):</b> <code>{result.docHash}</code></div>
      <br></br>
      <div className="mono"><b>IPFS CID (encrypted file):</b> <code>{result.cid}</code></div>
      <br></br>
      <div className="mono"><b>IV:</b> <code>{result.ivHex}</code></div>
      <br></br>
      <div className="mono"><b>Key (demo only):</b> <code>{result.keyHex}</code></div>
      <br></br>
      <div className="mono"><b>Encrypted gateway URL:</b><div ><code>{`https://gateway.pinata.cloud/ipfs/${result.cid}`}</code></div></div>
    </div>
  );
}
