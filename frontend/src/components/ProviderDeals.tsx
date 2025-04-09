"use client";
import { ReactTable } from "@/components/ReactTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Row } from "@tanstack/react-table";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  approveDeal,
  fetchDealDetails,
  fetchProviderDeals,
  releasePayment,
} from "@/lib/web3";
import type { AddressType, DealType } from "@/types/types";
import { toast } from "sonner";
import { formatEther } from "viem";

export default function ProviderDeals() {
  const [deals, setDeals] = useState<DealType[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<DealType[]>([]);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    syncDeals();
  }, []);

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

  async function syncDeals() {
    try {
      const deals = await fetchProviderDeals();
      const dealsData = (await Promise.all(
        deals.map(async (dealAddress: AddressType): Promise<DealType> => {
          const details = await fetchDealDetails(dealAddress);

          let status: DealType["status"] = "Active";
          if (details.completed) status = "Completed";
          else if (!details.isActive) status = "Waiting for Approval";

          return {
            userAddr: details.userAddress,
            dealAddr: dealAddress,
            status,
            price: Number(details.pricePerSector),
            remainingStorage: Number(details.sectorCount),
            validTill: Number(details.validTill),
          } as DealType;
        }),
      )) as DealType[];

      setDeals(dealsData);
    } catch (error) {
      toast.error("Error syncing deals");
      console.error(
        "Error syncing deals:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  const handleConfirmDeal = useCallback(async (userAddress: AddressType) => {
    try {
      await approveDeal(userAddress);
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.dealAddr === userAddress ? { ...deal, status: "Active" } : deal,
        ),
      );
    } catch (error) {
      toast.error("Failed to confirm deal");
      console.error(
        `Failed to confirm deal for ${userAddress}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }, []);

  const handleReleaseDeal = useCallback(async (userAddress: AddressType) => {
    await releasePayment(userAddress);
  }, []);

  const columns = useMemo(
    () => [
      { header: "User Wallet Address", accessorKey: "userAddr" },
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
        header: "Actions",
        cell: ({ row }: { row: Row<DealType> }) => {
          const { userAddr, dealAddr: addr, status } = row.original;
          const isWaitingForApproval = status === "Waiting for Approval";
          const isActive = status === "Active";

          return (
            <div className="flex gap-2">
              {/* Confirm Deal Button */}
              <Button
                variant="default"
                disabled={!isWaitingForApproval}
                className={`px-4 ${!isWaitingForApproval ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                onClick={() => handleConfirmDeal(addr)}
              >
                Confirm
              </Button>

              {/* Cancel Deal Button */}
              <Button
                variant="default"
                disabled={!isWaitingForApproval && !isActive}
                className={`px-4 ${!isWaitingForApproval && !isActive ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                onClick={() => handleReleaseDeal(userAddr)}
              >
                Release Payment
              </Button>
            </div>
          );
        },
      },
    ],
    [handleConfirmDeal, handleReleaseDeal],
  );

  return (
    <div className="flex justify-center size-full">
      <Card className="m-4 mt-8 lg:w-11/12 max-w-[1600px] max-xl:max-w-full h-fit">
        <CardHeader>
          <CardTitle className="flex justify-between gap-2 flex-wrap font-normal">
            <span className="font-bold text-lg">Provider Deals</span>
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
    </div>
  );
}
