P2P Cloud Storage

A lightweight decentralized cloud storage system where files are split into chunks and stored across multiple peer nodes. Built using Node.js, Express, React, and SQLite.

🚀 Features

Peer-to-peer file storage

Files split into encrypted chunks

Distributed chunk storage across peers

Online/offline peer tracking

Upload & download support

Chunk map visualization in UI

Clean modern dashboard (React)

🛠 Tech Stack

Backend: Node.js, Express, SQLite
Frontend: React (Vite), Axios
Peers: Independent Express servers

📂 Project Structure
backend/     → API + DB + Chunk Manager
peer1/       → Peer Node 1 (stores chunks)
peer2/       → Peer Node 2
peer3/       → Peer Node 3
frontend/    → React Dashboard

▶️ How to Run
1️⃣ Backend
cd backend
npm install
node src/server.js

2️⃣ Start Peers
cd peer1 && node server.js
cd peer2 && node server.js
cd peer3 && node server.js

3️⃣ Frontend
cd frontend
npm install
npm run dev
