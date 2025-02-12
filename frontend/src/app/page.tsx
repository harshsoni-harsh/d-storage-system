"use client";

import { useState } from "react";

const getFileHash = async (file: File | Blob) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string[]>([""]);
  const [fileHash, setFileHash] = useState<string>("");

  const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    const arrayBuffer = await file.arrayBuffer();

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;
      let chunkCIDs: string[] = [];

      const hashHex = await getFileHash(file);
      setFileHash(hashHex);
      console.log("Hash of uploaded file", file.name, hashHex);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end); // Get a chunk of the file

        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("chunkIndex", i.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("fileName", file.name);

        const res = await fetch("http://localhost:3002/storage/upload-chunk", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        chunkCIDs.push(data.cid);
        uploadedChunks++;
        console.log(`Uploaded chunk ${uploadedChunks}/${totalChunks}`);
      }
      console.log("All chunks uploaded:", chunkCIDs);
    } catch (error) {
      console.error("Upload error:", error);
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

      if (fileHash != hashHex) {
        alert("File integrity check failed");
        return;
      }

      const filename = prompt("Fill in file name") ?? "";

      const url = window.URL.createObjectURL(content);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
    } catch (error) {
      console.error("Retrieve error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col py-2 gap-8">
        <p className="text-xl font-bold">Manage files on IPFS with Helia</p>
        <div className="flex flex-col items-center gap-2 border border-zinc-600 p-8 rounded-lg">
          <input
            type="file"
            className="border border-zinc-500 rounded-full px-4 py-2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            className="font-bold border rounded-full px-4 py-2"
            onClick={handleUpload}
          >
            Upload to IPFS
          </button>
        </div>
        {cid && (
          <div className="flex flex-col gap-4 border border-zinc-600 p-8 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-lg max-md:hidden">CID: </p>
              <input
                type="text"
                placeholder="CID"
                value={cid[0]}
                onChange={(e) => setCid([e.target.value])}
                className="inline bg-zinc-950 border border-zinc-500 rounded-md px-2 py-1 max-md:w-full"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-lg max-md:hidden">
                Original file hash:{" "}
              </p>
              <input
                type="text"
                placeholder="SHA-256 hash"
                value={fileHash}
                onChange={(e) => setFileHash(e.target.value)}
                className="inline bg-zinc-950 border border-zinc-500 rounded-md px-2 py-1 max-md:w-full"
              />
            </div>
            <button
              className="py-2 px-4 border rounded-full"
              onClick={handleRetrieve}
            >
              Retrieve from IPFS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
