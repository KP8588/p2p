// -------------------------------------------------------
// backend/src/server.js  (FINAL WORKING VERSION)
// -------------------------------------------------------
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");

const filesRouter = require("./routes/files");
const peersRouter = require("./routes/peers");
const db = require("./db");
const config = require("./config");

const { STORAGE_ROOT } = config;

const app = express();
const PORT = 4000;

// -------------------------------------------------------
// Ensure storage root exists
// -------------------------------------------------------
if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  console.log("📁 Created storage root:", STORAGE_ROOT);
}

// -------------------------------------------------------
// CORS for React frontend
// -------------------------------------------------------
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// -------------------------------------------------------
// JSON Parsing
// -------------------------------------------------------
app.use(express.json({ limit: "500mb" }));

// -------------------------------------------------------
// API Routes
// -------------------------------------------------------
app.use("/api/files", filesRouter);
app.use("/api/peers", peersRouter);

// -------------------------------------------------------
// Static frontend (optional future deployment)
// -------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));

// -------------------------------------------------------
// Backend Health Check
// -------------------------------------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend running",
    time: new Date().toISOString(),
  });
});

// -------------------------------------------------------
// ENSURE PEERS EXIST IN DATABASE AT STARTUP
// -------------------------------------------------------
function ensurePeersInDB() {
  const stmt = db.prepare("SELECT COUNT(*) as count FROM peers");
  const count = stmt.get().count;

  if (count === 0) {
    console.log("📌 Seeding peers into database...");
    const insert = db.prepare(
      "INSERT INTO peers (id, url, status, last_seen) VALUES (?, ?, 'offline', CURRENT_TIMESTAMP)"
    );

    for (const peer of config.PEERS) {
      insert.run(peer.id, peer.url);
      console.log(`   → Added peer: ${peer.url}`);
    }
  }
}

// Run BEFORE heartbeat starts
ensurePeersInDB();

// -------------------------------------------------------
// ACTIVE HEARTBEAT — Ping each peer every 5 sec
// -------------------------------------------------------
async function pingPeers() {
  for (const peer of config.PEERS) {
    try {
      await axios.get(`${peer.url}/health`, { timeout: 3000 });

      db.prepare(
        "UPDATE peers SET status = 'online', last_seen = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(peer.id);

      console.log(`🟢 ONLINE: ${peer.url}`);
    } catch (err) {
      db.prepare(
        "UPDATE peers SET status = 'offline', last_seen = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(peer.id);

      console.log(`🔴 OFFLINE: ${peer.url}`);
    }
  }
}

setInterval(pingPeers, 5000); // every 5 seconds

// -------------------------------------------------------
// OFFLINE CHECKER — If no heartbeat for 30 sec → offline
// -------------------------------------------------------
setInterval(() => {
  const now = Date.now();
  const TIMEOUT = 30000; // 30 seconds

  const peers = db.prepare("SELECT * FROM peers").all();

  peers.forEach((peer) => {
    const lastSeen = new Date(peer.last_seen).getTime();
    const diff = now - lastSeen;

    if (diff > TIMEOUT && peer.status !== "offline") {
      db.prepare(
        "UPDATE peers SET status = 'offline' WHERE id = ?"
      ).run(peer.id);

      console.log(`⚠️ Marked OFFLINE due to timeout: ${peer.url}`);
    }
  });
}, 10000);

// -------------------------------------------------------
// Start Server
// -------------------------------------------------------
app.listen(PORT, () => {
  console.log("\n====================================");
  console.log("🚀 P2P Cloud Backend Running");
  console.log(`📡 http://localhost:${PORT}`);
  console.log("====================================\n");
});
