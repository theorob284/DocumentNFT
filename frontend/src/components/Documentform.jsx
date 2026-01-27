import React, { useState } from "react";
//This handles the document form, i.e. recipient, uploading document and the button the convert it to an NFT
export default function DocumentForm({account, onProcess, busy,}) {
  const [recipient, setRecipient] = useState(""); // gets the recipient (if left empty, defaults to connected metamask account)
  const [file, setFile] = useState(null); 

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6 }}> Recipient address (optional — defaults to connected wallet)</label>
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." style={{ width: "96%", padding: 8 }}/>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Choose a document</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>

      <button onClick={() => onProcess({ file, recipient })} disabled={!account || !file || busy}> Process → Upload → Mint </button>
    </div>
  );
}
