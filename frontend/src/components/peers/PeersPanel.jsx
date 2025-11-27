import React from "react";
import StatusDot from "../common/StatusDot";

const PeersPanel = ({ peers }) => {
  return (
    <div className="card">
      <div className="card-title">Peers</div>
      <div className="card-subtitle">Live Node Status</div>

      <div style={{ marginTop: 12 }}>
        {peers.length === 0 && <div>No peers registered yet.</div>}

        {peers.map((p) => (
          <div key={p.id} className="peer-item">
            <div>
              <div style={{ fontWeight: 600 }}>{p.url}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>
                ID: {p.peer_id}
              </div>
            </div>

            <StatusDot status={p.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeersPanel;
