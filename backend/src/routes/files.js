const express = require("express");
const router = express.Router();
const db = require("../db");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { STORAGE_ROOT, CHUNK_SIZE_BYTES, PEERS } = require("../config");

const upload = multer({ storage: multer.memoryStorage() });

// --------------------------------------------------------
// 1️⃣ LIST FILES  ->  GET /api/files
// --------------------------------------------------------
router.get("/", (req, res) => {
  const files = db
    .prepare("SELECT * FROM files ORDER BY created_at DESC")
    .all();
  res.json(files);
});

// --------------------------------------------------------
// 2️⃣ UPLOAD FILE  ->  POST /api/files/upload
//    Form: multipart/form-data, field name: "file"
// --------------------------------------------------------
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = req.file.buffer;
    const filename = req.file.originalname;

    const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE_BYTES);

    const fileInsert = db.prepare(
      "INSERT INTO files (filename, size, chunks) VALUES (?, ?, ?)"
    );
    const result = fileInsert.run(filename, buffer.length, totalChunks);
    const fileId = result.lastInsertRowid;

    console.log(
      `📦 Uploading file: ${filename} (${buffer.length} bytes, ${totalChunks} chunks)`
    );

    const chunkInsert = db.prepare(
      "INSERT INTO chunks (file_id, chunk_index, peer_id, peer_url, rel_path) VALUES (?, ?, ?, ?, ?)"
    );

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE_BYTES;
      const end = Math.min(start + CHUNK_SIZE_BYTES, buffer.length);
      const chunkBuffer = buffer.slice(start, end);

      // Round-robin assign logical peer from config
      const peersList =
        PEERS && PEERS.length
          ? PEERS
          : [{ id: 1, url: "http://localhost:4000" }];

      const assignedPeer = peersList[i % peersList.length];

      const relPath = path.join("chunks", `file_${fileId}_chunk_${i}.bin`);
      const absPath = path.join(STORAGE_ROOT, relPath);

      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, chunkBuffer);

      chunkInsert.run(
        fileId,
        i,
        assignedPeer.id,
        assignedPeer.url,
        relPath
      );

      console.log(
        `  ↳ Saved chunk #${i} (${chunkBuffer.length} bytes) as ${relPath} → peer ${assignedPeer.url}`
      );
    }

    res.json({ success: true, fileId, chunks: totalChunks });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// --------------------------------------------------------
// 3️⃣ CHUNK MAP  ->  GET /api/files/:fileId/chunk-map
//    Shape expected by frontend ChunkMap.jsx:
//    { fileId, chunks: [ { index, peers: [ { peerId, url } ] } ] }
// --------------------------------------------------------
router.get("/:fileId/chunk-map", (req, res) => {
  const fileId = req.params.fileId;

  const file = db.prepare("SELECT * FROM files WHERE id = ?").get(fileId);
  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  const rows = db
    .prepare("SELECT * FROM chunks WHERE file_id = ? ORDER BY chunk_index ASC")
    .all(fileId);

  const chunkMap = {};

  for (const row of rows) {
    if (!chunkMap[row.chunk_index]) {
      chunkMap[row.chunk_index] = {
        index: row.chunk_index,
        peers: [],
      };
    }

    chunkMap[row.chunk_index].peers.push({
      peerId: row.peer_id,
      url: row.peer_url,
    });
  }

  res.json({
    fileId,
    chunks: Object.values(chunkMap),
  });
});

// --------------------------------------------------------
// 4️⃣ DOWNLOAD FILE  ->  GET /api/files/:fileId/download
//    Reassembles the file from local chunk files
// --------------------------------------------------------
router.get("/:fileId/download", (req, res) => {
  const fileId = req.params.fileId;

  const file = db.prepare("SELECT * FROM files WHERE id = ?").get(fileId);
  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  const chunks = db
    .prepare("SELECT * FROM chunks WHERE file_id = ? ORDER BY chunk_index ASC")
    .all(fileId);

  if (!chunks.length) {
    return res.status(400).json({ error: "No chunks stored for this file" });
  }

  const buffers = [];

  try {
    for (const chunk of chunks) {
      const absPath = path.join(STORAGE_ROOT, chunk.rel_path);
      if (!fs.existsSync(absPath)) {
        throw new Error(`Missing chunk file: ${absPath}`);
      }
      const data = fs.readFileSync(absPath);
      buffers.push(data);
    }
  } catch (err) {
    console.error("❌ Download failed:", err);
    return res.status(500).json({ error: "Failed assembling chunks" });
  }

  const fullBuffer = Buffer.concat(buffers);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${file.filename}"`
  );
  res.setHeader("Content-Type", "application/octet-stream");
  res.send(fullBuffer);
});

module.exports = router;
