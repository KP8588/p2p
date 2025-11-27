const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "p2pcloud.db");
const db = new Database(dbPath);

// Files table: one row per uploaded file
db.exec(`
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  size INTEGER NOT NULL,
  chunks INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Chunks table: mapping file chunks to logical peers + disk location
db.exec(`
CREATE TABLE IF NOT EXISTS chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL,
  peer_id INTEGER NOT NULL,
  peer_url TEXT NOT NULL,
  rel_path TEXT NOT NULL,
  FOREIGN KEY (file_id) REFERENCES files(id)
);
`);

// Peers table: used for heartbeat + dashboard
db.exec(`
CREATE TABLE IF NOT EXISTS peers (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL,
  total_space INTEGER,
  free_space INTEGER,
  status TEXT DEFAULT 'offline',
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
