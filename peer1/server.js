const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001; // peer1 = 5001, peer2 = 5002, peer3 = 5003

// Storage folder
const STORAGE_DIR = path.join(__dirname, "storage");
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);

// Allow large chunk uploads (50 MB)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// ------------------ HEALTH CHECK ------------------
app.get("/health", (req, res) => {
  res.json({ status: "online", port: PORT });
});

// ------------------ RECEIVE CHUNK ------------------
app.post("/store-chunk", (req, res) => {
  const { chunkIndex, fileId, content } = req.body;

  if (!chunkIndex || !fileId || !content) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const filePath = path.join(STORAGE_DIR, `${fileId}_chunk_${chunkIndex}.bin`);
  const buffer = Buffer.from(content, "base64");

  fs.writeFileSync(filePath, buffer);
  res.json({ stored: true });
});

// ------------------ GET CHUNK ------------------
app.get("/get-chunk/:fileId/:chunkIndex", (req, res) => {
  const fileId = req.params.fileId;
  const chunkIndex = req.params.chunkIndex;

  const filePath = path.join(STORAGE_DIR, `${fileId}_chunk_${chunkIndex}.bin`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Chunk not found" });
  }

  const data = fs.readFileSync(filePath);
  res.send(data);
});


// ------------------ START ------------------
app.listen(PORT, () => {
  console.log(`Peer running on port ${PORT}`);
});
