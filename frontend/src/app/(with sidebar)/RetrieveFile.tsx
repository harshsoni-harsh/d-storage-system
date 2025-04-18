import { pinCID } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "sonner";

async function handlePinning(cid: string) {
  if (!cid) {
    toast.error("Please enter the CID of the file.");
    return;
  }

  try {
    await pinCID(cid);
    toast.success(`Successfully pinned CID ${cid}`);
  } catch (error) {
    console.error("Pinning error:", error);
    toast.error("Pinning error. Please check console.");
  }
}

export default function RetrieveFile({
  cid,
  setCid,
  handleRetrieve,
}: {
  cid: string;
  setCid: Dispatch<SetStateAction<string>>;
  handleRetrieve(cid: string): Promise<void>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [pinLoading, setPinLoading] = useState<boolean>(false);

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
          handleRetrieve(cid).then(() => setLoading(false));
        }}
        disabled={loading}
      >
        {loading ? "Downloading..." : "Download file"}
      </Button>
      <Button
        variant={"outline"}
        onClick={() => {
          setPinLoading(true);
          handlePinning(cid).then(() => setPinLoading(false));
        }}
        disabled={loading}
      >
        {pinLoading ? "Pinning..." : "Pin CID"}
      </Button>
    </div>
  );
}
