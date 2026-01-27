// server/index.js
import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();
app.use(cors());

const upload = multer();
const PINATA_JWT = process.env.PINATA_JWT; // the pinata server address

//post file to pinata server
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!PINATA_JWT) return res.status(500).json({ error: "Missing PINATA_JWT" }); // sanity checks to ensure pinata server correctly connected or if no file uploaded
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const form = new FormData(); // create new form
    form.append("file", new Blob([req.file.buffer]), req.file.originalname);

    const pinRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", { // hosting server on pinata, this is the link
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: form,
    });

    if (!pinRes.ok) { // failure check
      const text = await pinRes.text();
      return res.status(500).json({ error: "Pinata failed", details: text });
    }

    const data = await pinRes.json();
    return res.json({ cid: data.IpfsHash }); // return cid of document on pinata server to be used to retrieve the document
  } catch (e) {return res.status(500).json({ error: e.message });}
});

app.listen(3001, () => console.log("Server running on http://localhost:3001")); // local host for purposes of testing
