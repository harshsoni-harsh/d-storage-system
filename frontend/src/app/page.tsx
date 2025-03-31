"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { fetchCID, fetchPinnedFiles, uploadChunk } from "./actions";
import { getFileHash } from "@/lib/utils";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

export default function Home() {
  const [cid, setCid] = useState<string>("");

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="flex py-2 gap-8 max-xl:flex-col max-w-full">
        <div className="flex flex-col gap-4">
          <p className="text-xl font-bold">Manage files on IPFS with Helia</p>
          <UploadFile {...{ setCid }} />
          <RetrieveFile {...{ cid, setCid }} />
        </div>
        <PinnedFiles />
      </div>
    </div>
  );
}

function UploadFile({ setCid }: { setCid: Dispatch<SetStateAction<string>> }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    setLoading(true);
    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const hashHex = await getFileHash(file);
      console.log(`File Hash (${file.name}):`, hashHex);

      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(
          i * CHUNK_SIZE,
          Math.min((i + 1) * CHUNK_SIZE, file.size),
        );

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

  return (
    <div className="flex flex-col items-center gap-2 border border-zinc-600 p-8 rounded-lg">
      <Input
        type="file"
        className="border border-zinc-500 rounded-full px-4 py-2"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={loading}
      />
      <Button
        variant={"outline"}
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload to IPFS"}
      </Button>
    </div>
  )
}

async function handleRetrieve(cid: string) {
  if (!cid) return alert("Please enter the CID of the file.");

  try {
    const content = await fetchCID({ cid });
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
}

function RetrieveFile({ cid, setCid }: { cid: string; setCid: Dispatch<SetStateAction<string>> }) {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-4 border border-zinc-600 p-8 rounded-lg">
      <div className="flex items-center gap-2">
        <p className="font-bold text-lg">CID:</p>
        <Input
          type="text"
          placeholder="CID"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          className="dark:bg-zinc-950 border border-zinc-500 rounded-md px-2 py-1 w-full"
          disabled={loading}
        />
      </div>
      <Button
        variant={"outline"}
        onClick={() => {
          setLoading(true);
          handleRetrieve(cid).then(() => setLoading(false))
        }}
        disabled={loading}
      >
        {loading ? "Retrieving..." : "Retrieve from IPFS"}
      </Button>
    </div>
  )
}
function PinnedFiles() {
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

  return (
    <div className="flex flex-col gap-4 border border-zinc-600 p-8 rounded-lg">
      <p className="text-lg font-bold">Pinned Files</p>
      {pinnedFiles.length > 0 ? (
        pinnedFiles.map((cid, index) => (
          <div
            key={index}
            className="flex justify-between items-center border border-zinc-500 p-2 m-2 rounded-md"
          >
            <p className="text-sm font-bold mx-4 truncate">{cid}</p>
            <Button variant={"outline"} onClick={() => handleRetrieve(cid)}>
              Retrieve
            </Button>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400">No pinned files available.</p>
      )}
    </div>
  )
}
