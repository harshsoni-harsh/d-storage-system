"use client";
import { ReactTable } from "@/components/ReactTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { chunkifyAndUpload } from "@/lib/utils";
import { addCID, fetchDealDetails, fetchUserDeals, getCIDs } from "@/lib/web3";
import type { AddressType, DealType } from "@/types/types";
import type { Row } from "@tanstack/react-table";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { formatEther } from "viem";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function UserDeals() {
  const [deals, setDeals] = useState<DealType[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<DealType[]>([]);
  const [filterText, setFilterText] = useState<string>("");
  const [cidDialogOpen, setCidDialogOpen] = useState(false);
  const [cids, setCids] = useState<readonly string[]>([]);

  const syncDeals = useCallback(async () => {
    try {
      const deals = await fetchUserDeals();
      console.log(deals);
      const detailedDeals = await Promise.all(
        deals.map(async (dealAddress: AddressType): Promise<DealType> => {
          const details = await fetchDealDetails(dealAddress);
          let status: DealType["status"] = "Active";
          if (details.completed) status = "Completed";
          else if (!details.isActive) status = "Waiting for Approval";

          return {
            dealAddr: dealAddress,
            providerAddress: details.providerAddress,
            status: status,
            price: Number(details.pricePerSector),
            remainingStorage: Number(details.sectorCount),
            validTill: Number(details.validTill),
          } as DealType;
        }),
      );
      setDeals(detailedDeals);
    } catch (error) {
      console.error("Error syncing deals:", error);
    }
  }, []);

  const waitForFile = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "*/*";

      input.onchange = () => {
        const file = input.files?.[0] ?? null;
        resolve(file);
      };

      input.click();
    });
  }, []);

  const handleUpload = useCallback(async (dealAddr: AddressType) => {
    const file = await waitForFile();

    if (!file) {
      toast.error("No file selected");
      return;
    }
    const cid = await chunkifyAndUpload(file);
    if (cid) {
      await addCID(dealAddr, cid);
    }
  }, [waitForFile]);

  const checkCIDs = useCallback(async (dealAddr: AddressType) => {
    const cids = await getCIDs(dealAddr);
    setCids(cids);
    setCidDialogOpen(true);
  }, []);

  useEffect(() => {
    syncDeals();
  }, [syncDeals]);

  useEffect(() => {
    if (!filterText) setFilteredDeals(deals);
  }, [deals, filterText]);

  useEffect(() => {
    setFilteredDeals(
      deals.filter((deal) =>
        deal.dealAddr.toLowerCase().includes(filterText.toLowerCase()),
      ),
    );
  }, [filterText, deals]);

  const columns = useMemo(
    () => [
      { header: "Provider Address", accessorKey: "providerAddress" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: { row: Row<DealType> }) => {
          const status = row.original.status;
          const statusColor =
            status === "Active"
              ? "text-green-500"
              : status === "Cancelled"
                ? "text-red-500"
                : status === "Waiting for Approval"
                  ? "text-orange-500"
                  : "text-gray-500";
          return (
            <div className={`flex items-center ${statusColor}`}>
              <span>{status}</span>
            </div>
          );
        },
      },
      {
        header: "Price",
        accessorFn: (row: DealType) => `${formatEther(BigInt(row.price)) ?? "N/A"} ETH`
      },
      {
        header: "Remaining Storage (GB)",
        accessorFn: (row: DealType) => row.remainingStorage ?? "N/A",
      },
      {
        header: "Valid Till",
        accessorFn: (row: DealType) => {
          const date = new Date(row.validTill * 1000);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
      },
      {
        header: "Action",
        cell: ({ row }: { row: Row<DealType> }) => {
          const isActive = row.original.status === "Active";
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!isActive}
                onClick={() => handleUpload(row.original.dealAddr)}
                className={`px-4 ${!isActive ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                Upload
              </Button>
              <Button
                variant="outline"
                disabled={!isActive}
                onClick={() => checkCIDs(row.original.dealAddr)}
                className={`px-4 ${!isActive ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                Check CIDs
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="flex justify-center size-full">
      <Card className="m-4 mt-8 lg:w-11/12 max-w-[1600px] max-xl:max-w-full h-fit">
        <CardHeader>
          <CardTitle className="flex justify-between gap-2 flex-wrap font-normal">
            <span className="font-bold text-lg">Your Deals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center flex-wrap mb-2">
            <Input
              className="w-60 font-normal"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter Deals..."
            />
            <Button variant={"outline"} className="w-8 p-0" onClick={syncDeals}>
              <Image
                src="/icons/sync.svg"
                height={16}
                width={16}
                alt="Sync"
                className="dark:invert"
              />
            </Button>
          </div>
          <ReactTable data={filteredDeals} columns={columns} sortBy="status" />
        </CardContent>
      </Card>
      <Dialog open={cidDialogOpen} onOpenChange={setCidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CIDs</DialogTitle>
            <DialogDescription className="whitespace-pre pt-4">
              {JSON.stringify(cids, null, 4)}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
