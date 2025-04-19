"use client";

import { fetchCID } from "@/app/actions";
import { getFileHash } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import PinnedFiles from "./PinnedFiles";
import RetrieveFile from "./RetrieveFile";
import UploadFile from "./Uploadfile";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

export default function Home() {
  const [cid, setCid] = useState<string>("");

  return (
    <div className="size-full flex flex-col items-center justify-center p-8">
      <div className="flex py-2 gap-8 max-xl:flex-col max-w-full">
        <div className="flex flex-col gap-4">
          <p className="text-xl font-bold">Manage files on IPFS</p>
          <UploadFile {...{ setCid, CHUNK_SIZE }} />
          <RetrieveFile {...{ cid, setCid, handleRetrieve }} />
        </div>
        <PinnedFiles {...{ handleRetrieve }} />
      </div>
    </div>
  );
}

async function handleRetrieve(cid: string) {
  if (!cid) {
    toast.error("Please enter the CID of the file.");
    return;
  }

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
