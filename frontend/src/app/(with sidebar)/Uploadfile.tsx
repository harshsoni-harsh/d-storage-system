import { fetchPinnedFiles } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chunkifyAndUpload } from "@/lib/utils";
import { type Dispatch, type SetStateAction, useState } from "react";

export default function UploadFile({
  setCid,
  CHUNK_SIZE,
}: { setCid: Dispatch<SetStateAction<string>>; CHUNK_SIZE: number }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!files) return alert("Please select a file first.");

    setLoading(true);
    try {
      for (let file of files) {
        chunkifyAndUpload(file, CHUNK_SIZE, setCid, fetchPinnedFiles);
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
        multiple
        className="border border-zinc-500 rounded-full px-4 py-2 hover:bg-zinc-900"
        onChange={(e) => setFiles(e.target.files)}
        disabled={loading}
      />
      <Button variant={"outline"} onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload to IPFS"}
      </Button>
    </div>
  );
}
