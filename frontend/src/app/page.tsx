"use client";

import { useEffect, useState } from "react";
import { fetchCID, fetchPinnedFiles, uploadChunk } from "./actions";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

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
  const [loading, setLoading] = useState<boolean>(false);
  const [pinnedFiles, setPinnedFiles] = useState<string[]>([]);

  async function fetchPins() {
    try {
      const data = await fetchPinnedFiles();
      setPinnedFiles(data);
    } catch (error) {
      console.error("Error fetching pinned files:", error);
      setPinnedFiles([]);
    }
  }

  useEffect(() => {
    fetchPins();
  }, []);


  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    setLoading(true);
    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const hashHex = await getFileHash(file);
      console.log(`File Hash (${file.name}):`, hashHex);

      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, file.size));
        
        const data = await uploadChunk(chunk, i, totalChunks, file.name);

        console.log(`Uploaded chunk ${i + 1}/${totalChunks}`);
        if (i === totalChunks - 1) {
          setCid(`${data.cid}`);
          await fetchPinnedFiles();
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieve = async (cid: string) => {
    if (!cid) return alert("Please enter the CID of the file.");

    try {
      const content = await fetchCID({ cid });;
      const hashHex = await getFileHash(content);
      console.log("Hash of received file:", hashHex);

      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = cid;
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
      <div className="flex py-2 gap-8">
        <div className="flex flex-col gap-4">
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
            <button
              className="py-2 px-4 border rounded-full"
              onClick={() => handleRetrieve(cid)}
              disabled={loading}
            >
              {loading ? "Retrieving..." : "Retrieve from IPFS"}
            </button>
          </div>
        </div>

        {/* Pinned Files Section */}
        <div className="flex flex-col gap-4 border border-zinc-600 p-8 rounded-lg w-full">
          <p className="text-lg font-bold">Pinned Files</p>
          {pinnedFiles.length > 0 ? (
            pinnedFiles.map((cid, index) => (
              <div key={index} className="flex justify-between items-center border border-zinc-500 p-2 m-2 rounded-md">
                <div>
                  <p className="text-sm font-bold mx-4">{cid}</p>
                </div>
                <button
                  className="text-sm border px-2 py-1 rounded-md"
                  onClick={() => handleRetrieve(cid)}
                >
                  Retrieve
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No pinned files available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
