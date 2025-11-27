import React from "react";
import UploadCard from "./UploadCard";

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < sizes.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${sizes[i]}`;
};

const getIcon = (name = "") => {
  const ext = name.split(".").pop().toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼️";
  if (["mp4", "mkv", "mov"].includes(ext)) return "📽️";
  if (["mp3", "wav", "flac"].includes(ext)) return "🎵";
  if (["pdf"].includes(ext)) return "📄";
  if (["zip", "rar", "7z"].includes(ext)) return "🗜️";
  return "📁";
};

const FilesPanel = ({
  files,
  onFileSelected,
  uploading,
  progress,
  onShowChunkMap,
}) => {
  return (
    <div className="card">
      <div className="card-title">Files</div>
      <div className="card-subtitle">
        Distributed file index stored across peers.
      </div>

      <UploadCard
        onFileSelected={onFileSelected}
        uploading={uploading}
        progress={progress}
      />

      <div className="table-wrapper" style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Size</th>
              <th>Chunks</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 && (
              <tr>
                <td colSpan={5}>No files uploaded yet.</td>
              </tr>
            )}

            {files.map((file) => (
              <tr key={file.id}>
                <td>
                  {getIcon(file.filename || file.original_name)}{" "}
                  {file.filename || file.original_name}
                </td>
                <td>{formatBytes(file.original_size || file.size)}</td>
                <td>
                  <span className="row-pill">
                    {file.chunks_count ?? file.chunks ?? "-"}
                  </span>
                </td>
                <td>
                  {file.created_at
                    ? new Date(file.created_at).toLocaleString()
                    : "-"}
                </td>
                <td>
                  <a
                    className="row-pill"
                    href={`http://localhost:4000/api/files/${file.id}/download`}
                  >
                    ⬇ Download
                  </a>{" "}
                  <button
                    className="row-pill"
                    style={{
                      border: "none",
                      cursor: "pointer",
                      background: "rgba(79,70,229,0.12)",
                    }}
                    onClick={() => onShowChunkMap(file)}
                  >
                    🔍 Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FilesPanel;
