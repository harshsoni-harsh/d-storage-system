import { uploadChunk } from "@/app/actions";
import { type ClassValue, clsx } from "clsx";
import { SetStateAction } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getFileHash(file: File | Blob) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function chunkifyAndUpload(
  file: File,
  CHUNK_SIZE: number = 10 * 1024 * 1024,
  setCid?: (value: SetStateAction<string>) => void,
  fetchPinnedFiles?: () => Promise<string[]>
) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const hashHex = await getFileHash(file);
  console.log(`File Hash (${file.name}):`, hashHex);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = file.slice(
      i * CHUNK_SIZE,
      Math.min((i + 1) * CHUNK_SIZE, file.size)
    );

    const data = await uploadChunk(chunk, i, totalChunks, file.name);

    console.log(`Uploaded chunk ${i + 1}/${totalChunks}`);
    if (i === totalChunks - 1 && setCid && fetchPinnedFiles) {
      setCid(`${data.cid}`);
      await fetchPinnedFiles();
    }
    return data.cid;
  }
}
