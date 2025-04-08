import { fetchPinnedFiles, unpin } from "@/app/actions";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { PinOff, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function PinnedFiles({
  handleRetrieve,
}: { handleRetrieve(cid: string): Promise<void> }) {
  const [pinnedFiles, setPinnedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPinnedFiles();
      setPinnedFiles(data);
    } catch (error) {
      console.error("Error fetching pinned files:", error);
      setPinnedFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(
    async (cid: string) => {
      try {
        await unpin(cid);
        const updatedData = pinnedFiles.filter((pin) => pin !== cid);
        setPinnedFiles(updatedData);
      } catch (error) {
        toast.error(`Error unpinning CID: ${cid}`);
        console.error(error instanceof Error ? error.message : error);
      }
    },
    [pinnedFiles],
  );

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  return (
    <div className="flex flex-col gap-4 border border-zinc-600 p-8 rounded-lg">
      <p className="text-lg font-bold">Pinned Files</p>
      {loading ? (
        <Loader />
      ) : pinnedFiles.length > 0 ? (
        pinnedFiles.map((cid) => (
          <div
            key={cid}
            className="flex justify-between items-center border border-zinc-500 p-2 m-2 rounded-md gap-1"
          >
            <p className="text-sm font-bold mx-4 truncate">{cid}</p>
            <div className="flex gap-2">
              <Button variant={"secondary"} onClick={() => handleRetrieve(cid)}>
                Retrieve
              </Button>
              <Button
                variant={"outline"}
                onClick={() => handleDelete(cid)}
                className="hover:text-red-500 "
              >
                <PinOff />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400">No pinned files available.</p>
      )}
    </div>
  );
}
