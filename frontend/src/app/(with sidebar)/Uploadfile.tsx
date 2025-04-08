import { fetchPinnedFiles, uploadChunk } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFileHash } from "@/lib/utils";
import { type Dispatch, type SetStateAction, useState } from "react";

export default function UploadFile({
  setCid,
  CHUNK_SIZE,
}: { setCid: Dispatch<SetStateAction<string>>; CHUNK_SIZE: number }) {
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
      <Button variant={"outline"} onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload to IPFS"}
      </Button>
    </div>
  );
}
