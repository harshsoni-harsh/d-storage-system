"use client";

import { useState } from "react";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
const API_BASE_URL = "http://localhost:3002/storage";

const getFileHash = async (file: File | Blob) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>("");
  const [fileHash, setFileHash] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    setLoading(true);
    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const hashHex = await getFileHash(file);
      setFileHash(hashHex);
      console.log(`File Hash (${file.name}):`, hashHex);

      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, file.size));
        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("chunkIndex", i.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("fileName", file.name);

        const res = await fetch(`${API_BASE_URL}/upload-chunk`, { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || `Failed to upload chunk ${i + 1}`);

        console.log(`Uploaded chunk ${i + 1}/${totalChunks}`);
        if (i === totalChunks - 1) setCid(data.cid);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieve = async () => {
    if (!cid) return;
  
    try {
      const response = await fetch(
        `http://localhost:3002/storage/getById?cid=${cid}`
      );
  
      if (!response.ok) {
        throw new Error(`Error retrieving file: ${response.statusText}`);
      }
  
      const content = await response.blob();
      const hashHex = await getFileHash(content);
      console.log("Hash of received file", hashHex);
  
      if (fileHash !== hashHex) {
        alert("File integrity check failed");
        return;
      }
  
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Retrieve error:", error);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col py-2 gap-8">
        <p className="text-xl font-bold">Manage files on IPFS with Helia</p>

        {/* File Upload Section */}
        <div className="flex flex-col items-center gap-2 border border-zinc-600 p-8 rounded-lg">
          <input
            type="file"
            className="border border-zinc-500 rounded-full px-4 py-2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={loading}
          />
          <button
            className="font-bold border rounded-full px-4 py-2"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload to IPFS"}
          </button>
        </div>

        {/* File Retrieval Section */}
        <div className="flex flex-col gap-4 border border-zinc-600 p-8 rounded-lg">
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg">CID:</p>
            <input
              type="text"
              placeholder="CID"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              className="bg-zinc-950 border border-zinc-500 rounded-md px-2 py-1 w-full"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg">Original file hash:</p>
            <input
              type="text"
              placeholder="SHA-256 hash"
              value={fileHash}
              onChange={(e) => setFileHash(e.target.value)}
              className="bg-zinc-950 border border-zinc-500 rounded-md px-2 py-1 w-full"
              disabled={loading}
            />
          </div>
          <button
            className="py-2 px-4 border rounded-full"
            onClick={handleRetrieve}
            disabled={loading}
          >
            {loading ? "Retrieving..." : "Retrieve from IPFS"}
          </button>
        </div>
      </div>
    </div>
  );
}
