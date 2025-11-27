import React from "react";

const Sidebar = ({ stats }) => {
  const { totalFiles, totalPeers, onlinePeers } = stats || {};

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-title">P2P CLOUD</div>
        <div className="sidebar-sub">Decentralized Storage Network</div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-stat">
          <span>Files Stored</span>
          <strong>{totalFiles ?? 0}</strong>
        </div>

        <div className="sidebar-stat">
          <span>Total Peers</span>
          <strong>{totalPeers ?? 0}</strong>
        </div>

        <div className="sidebar-stat">
          <span>Online Peers</span>
          <strong>{onlinePeers ?? 0}</strong>
        </div>
      </div>

      <div style={{ marginTop: "auto", fontSize: 12, color: "#666" }}>
        Built by YOU · MCA Project · 2025
      </div>
    </aside>
  );
};

export default Sidebar;
