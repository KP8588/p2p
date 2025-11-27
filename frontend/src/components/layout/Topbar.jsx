import React from "react";

const Topbar = ({ theme, onToggleTheme }) => {
  const isDark = theme === "dark";
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">Decentralized Cloud Storage</div>
        <div className="topbar-subtitle">
          Encrypted • Chunked • Redundant • Peer-to-Peer
        </div>
      </div>

      <button className="upload-secondary-btn" onClick={onToggleTheme}>
        {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
    </header>
  );
};

export default Topbar;
