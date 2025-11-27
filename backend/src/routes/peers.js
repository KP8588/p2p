const express = require("express");
const db = require("../db");

const router = express.Router();

/**
 * -----------------------------------------------------------
 * 1️⃣  REGISTER PEER
 * -----------------------------------------------------------
 * Called by each peer on startup.
 * Sends: peerId, url, totalSpace, freeSpace
 * Creates or updates the peer in the database.
 */
router.post("/register", (req, res) => {
  const { peerId, url, totalSpace, freeSpace } = req.body;

  if (!peerId || !url) {
    return res.status(400).json({ error: "peerId and url are required" });
  }

  const existing = db.prepare("SELECT * FROM peers WHERE id = ?").get(peerId);

  if (existing) {
    // Update free space & last seen
    db.prepare(
      `UPDATE peers 
       SET free_space = ?, last_seen = CURRENT_TIMESTAMP, status = 'online'
       WHERE id = ?`
    ).run(freeSpace, peerId);
  } else {
    // Insert new peer entry
    db.prepare(
      `INSERT INTO peers (id, url, total_space, free_space, status)
       VALUES (?, ?, ?, ?, 'online')`
    ).run(peerId, url, totalSpace, freeSpace);
  }

  return res.json({ message: "Peer registered/updated", peerId });
});

/**
 * -----------------------------------------------------------
 * 2️⃣  HEARTBEAT ENDPOINT
 * -----------------------------------------------------------
 * Called every 10 seconds by peer servers.
 * Updates last_seen and sets peer status to 'online'.
 */
router.post("/heartbeat", (req, res) => {
  const { peerId } = req.body;

  if (!peerId) {
    return res.status(400).json({ error: "peerId is required" });
  }

  db.prepare(
    `UPDATE peers 
     SET last_seen = CURRENT_TIMESTAMP, status = 'online'
     WHERE id = ?`
  ).run(peerId);

  return res.json({ message: "Heartbeat received", peerId });
});

/**
 * -----------------------------------------------------------
 * 3️⃣  LIST OF PEERS (For Debugging / UI)
 * -----------------------------------------------------------
 * GET /api/peers/list
 * Shows all registered peers with status & last_seen.
 */
router.get("/list", (req, res) => {
  const rows = db.prepare("SELECT * FROM peers").all();
  return res.json(rows);
});

module.exports = router;
