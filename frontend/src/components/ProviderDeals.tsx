'use client'
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from '@/components/ReactTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";  

type ProviderDealType = {
  addr: string;
  status: 'Active' | 'Cancelled' | 'Completed' | 'Waiting for Approval';
  price: number;
  remainingStorage?: number;
  remainingDuration?: string;
  timestamp: string;
  cancelReason?: string;
};

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
    const dummyDeals: ProviderDealType[] = [
      { addr: '0x123aladkaljdkajdabc', status: 'Active', price: 15.5, remainingStorage: 100, remainingDuration: '30 days', timestamp: '2024-04-01 12:00:00' },
      { addr: '0x456...def', status: 'Cancelled', price: 10, timestamp: '2024-03-28 10:30:00', cancelReason: 'Provider unresponsive' },
      { addr: '0x789...ghi', status: 'Completed', price: 20, timestamp: '2024-02-20 08:15:00' },
      { addr: '0x321...jkl', status: 'Waiting for Approval', price: 25, timestamp: '2024-03-20 12:00:00', cancelReason: 'Pending review' },
      { addr: '0xAAA111BBB222CCC333', status: 'Active', price: 18, remainingStorage: 200, remainingDuration: '45 days', timestamp: '2024-04-05 14:20:00' },
      { addr: '0xDDD444EEE555FFF666', status: 'Cancelled', price: 12, timestamp: '2024-03-15 09:00:00', cancelReason: 'Insufficient funds' },
      { addr: '0xGGG777HHH888III999', status: 'Completed', price: 22, timestamp: '2024-01-30 16:45:00' },
      { addr: '0xJJJ000KKK111LLL222', status: 'Waiting for Approval', price: 30, remainingStorage: 150, remainingDuration: '60 days', timestamp: '2024-04-10 11:30:00' },
    ];
    setDeals(dummyDeals);
  }

  function handleConfirmDeal(addr: string) {
    setDeals(prevDeals =>
      prevDeals.map(deal => 
        deal.addr === addr ? { ...deal, status: 'Active' } : deal
      )
    );
  }

  function handleCancelDeal(addr: string) {
    setDeals(prevDeals =>
      prevDeals.map(deal => 
        deal.addr === addr ? { ...deal, status: 'Cancelled', cancelReason: reasonMap[addr] || '' } : deal
      )
    );
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
        accessorFn: (row: ProviderDealType) => (row.status === 'Active' ? row.remainingStorage ?? 'N/A' : 'N/A'),
      },
      {
        header: 'Remaining Duration',
        accessorFn: (row: ProviderDealType) => (row.status === 'Active' ? row.remainingDuration ?? 'N/A' : 'N/A'),
      },
      { header: 'Timestamp', accessorKey: 'timestamp' },
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
