import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// -------- FILES --------
export const fetchFiles = () => api.get("/files");

export const uploadFile = (formData, onProgress) =>
  api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress,
  });

export const fetchChunkMap = (fileId) =>
  api.get(`/files/${fileId}/chunk-map`);

// -------- PEERS --------
export const fetchPeers = () => api.get("/peers/list");
