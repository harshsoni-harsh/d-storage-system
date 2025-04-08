"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DealDialogProps } from "@/types/types";
import { useState } from "react";

export default function DealDialog({
  peer,
  addr,
  price,
  onCreateDeal,
  text,
}: DealDialogProps) {
  const [duration, setDuration] = useState(0);
  const [storageSize, setStorageSize] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dummy buyer address (common for all)
  const buyerAddr = "QmVtZXN0ZXJzUG9vcnQxMjM=";

  const handleCreateDeal = async () => {
    if (storageSize !== 0 && duration !== 0) {
      await onCreateDeal({ duration, storageSize });
      setIsDialogOpen(false); // Close dialog after deal creation
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          {text || "Create Deal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-fit max-w-full">
        <DialogHeader className="max-w-full overflow-hidden">
          <DialogTitle>Confirm Deal Details</DialogTitle>
          <DialogDescription>
            Please review the details of your deal before confirming.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            <strong>Buyer Address:</strong> {buyerAddr}
          </p>
          <p>
            <strong>Provider Address:</strong> {addr}
          </p>
          <p>
            <strong>Provider Peer ID:</strong> {peer}
          </p>
          <p>
            <strong>Price:</strong> {price}
          </p>

          <div>
            <label
              htmlFor="storage-size"
              className="block text-sm font-medium text-gray-300"
            >
              Storage Size (GB)
            </label>
            <Input
              id="storage-size"
              type="number"
              value={Number.isNaN(storageSize) ? "" : String(storageSize)}
              onChange={(e) => setStorageSize(Number.parseInt(e.target.value ?? 0))}
              placeholder="Enter storage size (e.g. 10 or 10.50)"
              className="mt-1"
            />
          </div>

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-300"
            >
              Duration (Days)
            </label>
            <Input
              id="duration"
              type="number"
              value={Number.isNaN(duration) ? "" : String(duration)}
              onChange={(e) => setDuration(Number.parseInt(e.target.value ?? 0))}
              placeholder="Enter duration in days (e.g. 30)"
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={handleCreateDeal}
            className="text-white"
          >
            Create Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
