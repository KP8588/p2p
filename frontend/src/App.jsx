import React, { useEffect, useState, useMemo } from "react";
import "./index.css";

import AppLayout from "./components/layout/AppLayout";
import FilesPanel from "./components/files/FilesPanel";
import PeersPanel from "./components/peers/PeersPanel";
import StatCard from "./components/common/StatCard";
import ChunkMap from "./components/files/ChunkMap";

import {
  fetchFiles,
  fetchPeers,
  uploadFile,
  fetchChunkMap,
} from "./api";
import { gsap } from "gsap";

const App = () => {
  const [files, setFiles] = useState([]);
  const [peers, setPeers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [theme, setTheme] = useState("light");

  const [selectedFile, setSelectedFile] = useState(null);
  const [chunkMap, setChunkMap] = useState(null);

  const stats = useMemo(() => {
    const online = peers.filter((p) => p.status === "online").length;
    return {
      totalFiles: files.length,
      totalPeers: peers.length,
      onlinePeers: online,
    };
  }, [files, peers]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    gsap.to("body", {
      backgroundColor: theme === "dark" ? "#020617" : "#f7f9fc",
      duration: 0.4,
      ease: "power2.out",
    });
  }, [theme]);

  const loadData = async () => {
    try {
      const [fRes, pRes] = await Promise.all([
        fetchFiles(),
        fetchPeers(),
      ]);
      setFiles(fRes.data || []);
      setPeers(pRes.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 6000);
    return () => clearInterval(id);
  }, []);

  const handleFileUpload = async (file) => {
    setUploading(true);
    setProgress(0);
    try {
      const form = new FormData();
      form.append("file", file);

      await uploadFile(form, (evt) => {
        if (evt.total) {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      });

      await loadData();
    } catch (e) {
      console.error("Upload error:", e);
    }
    setUploading(false);
  };

  const handleShowChunkMap = async (file) => {
    setSelectedFile(file);
    setChunkMap(null);
    try {
      const res = await fetchChunkMap(file.id);
      setChunkMap(res.data);
    } catch (e) {
      console.error("Chunk map error:", e);
    }
  };

  const toggleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <AppLayout stats={stats} theme={theme} onToggleTheme={toggleTheme}>
      <div className="dashboard-grid">
        <div>
          <div className="stat-row">
            <StatCard label="Total Files" value={stats.totalFiles} />
            <StatCard
              label="Peers Online"
              value={`${stats.onlinePeers}/${stats.totalPeers}`}
            />
          </div>

          <FilesPanel
            files={files}
            onFileSelected={handleFileUpload}
            uploading={uploading}
            progress={progress}
            onShowChunkMap={handleShowChunkMap}
          />
        </div>

        <div>
          <PeersPanel peers={peers} />
          <ChunkMap file={selectedFile} chunkMap={chunkMap} peers={peers} />
        </div>
      </div>
    </AppLayout>
  );
};

export default App;
