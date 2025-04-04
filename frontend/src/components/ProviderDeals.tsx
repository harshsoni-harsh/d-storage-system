'use client'
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from '@/components/ReactTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { fetchProviderDeals, fetchDealDetails, getProviders, approveDeal } from '@/lib/contract-interactions';
import { AddressType, ProviderDealType } from '@/types/types';

export default function ProviderDeals() {
  const [deals, setDeals] = useState<ProviderDealType[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<ProviderDealType[]>([]);
  const [filterText, setFilterText] = useState<string>(''); 
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});

  useEffect(() => {
    syncDeals();
  }, []);

  useEffect(() => {
    if (!filterText) setFilteredDeals(deals);
  }, [deals]);

  useEffect(() => {
    setFilteredDeals(
      deals.filter(deal => deal.addr.toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [filterText, deals]);

  async function syncDeals() {
    try {
      const providers = await getProviders();
      const deals = await Promise.all(providers.map(async provider => {
        const deals = await fetchProviderDeals(provider) as AddressType[];
        return await Promise.all(
          deals.map(async (dealAddress: AddressType) : Promise<ProviderDealType> => { 
            const details = await fetchDealDetails(dealAddress);
    
            let status: ProviderDealType['status'] = 'Active';
            if (details.isCompleted) status = 'Completed';
            else if (!details.isActive) status = 'Waiting for Approval';
            
            return ({
              addr: dealAddress,
              status,
              price: Number(details.pricePerSector),
              remainingStorage: Number(details.sectorCount),
              validTill: Number(details.validTill)
            } as ProviderDealType);
          })
        ) as ProviderDealType[];
      }));
      const dealsData = deals.flat();
      
      setDeals(dealsData);
    } catch (error) {
      console.error('Error syncing deals:', error);
  
    }
  }

  async function handleConfirmDeal(dealAddress: AddressType) {
  try {
    await approveDeal(dealAddress);
    setDeals(prevDeals =>
      prevDeals.map(deal =>
        deal.addr === dealAddress
          ? { ...deal, status: 'Active' }
          : deal
      )
    );
  } catch (error) {
    console.error(`Failed to confirm deal ${dealAddress}:`, error);
  }
}

async function handleCancelDeal(dealAddress: AddressType){
  
}

  const columns = useMemo(
    () => [
      { header: 'User Wallet Address', accessorKey: 'addr' },
      { 
        header: 'Status', 
        accessorKey: 'status', 
        cell: ({ row }: { row: any }) => {
          const status = row.original.status;
          const statusColor =
            status === 'Active'
              ? 'text-green-500'
              : status === 'Cancelled'
              ? 'text-red-500'
              : status === 'Waiting for Approval'
              ? 'text-orange-500'
              : 'text-gray-500';
          return (
            <div className={`flex items-center ${statusColor}`}>
              <span>{status}</span>
            </div>
          );
        }
      },
      { header: 'Price ($)', accessorKey: 'price' },
      {
        header: 'Remaining Storage (GB)',
        accessorFn: (row: ProviderDealType) => row.remainingStorage ?? 'N/A',
      },      
      {
        header: 'Valid Till',
        accessorFn: (row: ProviderDealType) => {
          const date = new Date(row.validTill * 1000);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
      },
      {
        header: 'Reason',
        cell: ({ row }: { row: any }) => {
          const { addr, status } = row.original;
          const isWaitingForApproval = status === 'Waiting for Approval' || status === 'Active';
          return (
            <div>
              {isWaitingForApproval && !reasonMap[addr] && (
                <Button
                  variant="outline"
                  onClick={() => setReasonMap(prev => ({ ...prev, [addr]: '' }))}
                >
                  Add Reason
                </Button>
              )}
              {isWaitingForApproval && reasonMap[addr] && (
                <Input
                  className="w-40 text-sm mt-2"
                  placeholder="Enter reason..."
                  value={reasonMap[addr]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setReasonMap((prev) => ({ ...prev, [addr]: value }));
                  }}
                />
              )}
            </div>
          );
        },
      },
      {
        header: 'Actions',
        cell: ({ row }: { row: any }) => {
          const { addr, status } = row.original;
          const isWaitingForApproval = status === 'Waiting for Approval';
          const isActive = status === 'Active';

          return (
            <div className="flex gap-2">
              {/* Confirm Deal Button */}
              <Button
                variant="default"
                disabled={!isWaitingForApproval}
                className={`px-4 ${!isWaitingForApproval ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                onClick={() => handleConfirmDeal(addr)}
              >
                Confirm
              </Button>

              {/* Cancel Deal Button */}
              <Button
                variant="destructive"
                disabled={!isWaitingForApproval && !isActive}
                className={`px-4 ${(!isWaitingForApproval && !isActive) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                onClick={() => handleCancelDeal(addr)}
              >
                Cancel
              </Button>
            </div>
          );
        },
      },
    ],
    [reasonMap]
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
              onChange={e => setFilterText(e.target.value)}
              placeholder="Filter Deals..."
            />
            <Button variant={'outline'} className="w-8 p-0" onClick={syncDeals}>
              <Image src='/icons/sync.svg' height={16} width={16} alt='Sync' className="dark:invert" />
            </Button>
          </div>
          <ReactTable data={filteredDeals} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
