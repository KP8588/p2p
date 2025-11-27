import React, { useRef } from "react";

const UploadCard = ({ onFileSelected, uploading, progress }) => {
  const fileRef = useRef();

  const handleChoose = () => fileRef.current.click();

  const handleUpload = () => {
    if (!fileRef.current.files.length) return;
    onFileSelected(fileRef.current.files[0]);
  };

  return (
    <div className="upload-card">
      <input type="file" ref={fileRef} style={{ display: "none" }} />

      <button className="upload-secondary-btn" onClick={handleChoose}>
        Choose File
      </button>

      {fileRef.current?.files[0] && (
        <div style={{ marginTop: 8, color: "#333" }}>
          {fileRef.current.files[0].name}
        </div>
      )}

      <button
        className="primary-btn"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? `Uploading... ${progress}%` : "Upload to P2P Cloud"}
      </button>
    </div>
  );
};

export default UploadCard;
