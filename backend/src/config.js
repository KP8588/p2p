const path = require("path");

module.exports = {
  // Root storage folder for backend (file metadata + DB stuff)
  STORAGE_ROOT: path.join(__dirname, "../storage"),

  // File chunking
  CHUNK_SIZE_BYTES: 1024 * 1024, // 1MB per chunk

  // Encryption config
  ENCRYPTION_ALGO: "aes-256-gcm",
  ENCRYPTION_KEY: Buffer.from(
    "0123456789abcdef0123456789abcdef",
    "utf8"
  ),

  // Most IMPORTANT PART — list of peers in the network
  PEERS: [
    { id: 1, url: "http://localhost:5001" },
    { id: 2, url: "http://localhost:5002" },
    { id: 3, url: "http://localhost:5003" },
  ],
};
