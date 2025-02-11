"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string[]>(['']);

  const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;
      let chunkCIDs: string[] = [];

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

      const content = await response.text();
      console.log(content)
      alert(`Retrieved Content: ${content}`);
    } catch (error) {
      console.error("Retrieve error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-2">
      <p className="text-xl font-bold">Manage files on IPFS with Helia</p>
      <input
        type="file"
        className="border-2 border-zinc-500 rounded-full px-4 py-2"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <br />
      <button
        className="font-bold border-2 rounded-full px-4 py-2"
        onClick={handleUpload}
      >
        Upload to IPFS
      </button>
      
      <br />
      {cid && (
        <>
          <div className="flex flex-col gap-2">
            <span>CID: </span>
            <input type="text" value={cid[0]} onChange={e => setCid([e.target.value])} className="inline bg-zinc-800 border-2 border-zinc-500 rounded-md px-2 py-1" />
          </div>
          <button className="bg-block py-2 px-4 border-2 rounded-full" onClick={handleRetrieve}>Retrieve from IPFS</button>
        </>
      )}
    </div>
  );
}
