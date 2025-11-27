import React from "react";

const ChunkMap = ({ file, chunkMap, peers }) => {
  if (!file) {
    return (
      <div className="card">
        <div className="card-title">Chunk Map</div>
        <div className="card-subtitle">
          Select a file to see how its chunks are distributed.
        </div>
      </div>
    );
  }

  if (!chunkMap) {
    return (
      <div className="card">
        <div className="card-title">Chunk Map</div>
        <div className="card-subtitle">Loading map…</div>
      </div>
    );
  }

  const peerById = {};
  peers.forEach((p) => {
    peerById[p.id] = p;
  });

  return (
    <div className="card">
      <div className="card-title">Chunk Map</div>
      <div className="card-subtitle">
        {file.filename || file.original_name} — {chunkMap.chunks.length} chunks
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Chunk</th>
              <th>Peers</th>
            </tr>
          </thead>
          <tbody>
            {chunkMap.chunks.map((chunk) => (
              <tr key={chunk.index}>
                <td>#{chunk.index}</td>
                <td>
                  {chunk.peers.map((p) => {
                    const full = peerById[p.peerId];
                    const label = p.url || (full && full.url) || "unknown";
                    const short = label.replace("http://", "");
                    const online = full?.status === "online";
                    return (
                      <span
                        key={p.peerId + "-" + chunk.index}
                        className="row-pill"
                        style={{
                          marginRight: 4,
                          backgroundColor: online
                            ? "rgba(22,163,74,0.15)"
                            : "rgba(248,113,113,0.15)",
                        }}
                      >
                        {short}
                      </span>
                    );
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChunkMap;
