'use client'
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from '@/components/ReactTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";  // For the refresh icon
import { FaInfoCircle } from 'react-icons/fa';  // For the info icon

type UserDealType = {
  addr: string;
  status: 'Active' | 'Cancelled' | 'Completed' | 'Waiting for Approval';
  price: number;
  remainingStorage?: number;
  remainingDuration?: string;
  timestamp: string;
  cancelReason?: string;
};

export default function UserDeals() {
  const [deals, setDeals] = useState<UserDealType[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<UserDealType[]>([]);
  const [filterText, setFilterText] = useState<string>(''); 

  useEffect(() => {
    syncDeals();
  }, []);

  useEffect(() => {
    if (!filterText) setFilteredDeals(deals);
  }, [deals]);

  useEffect(() => {
    setFilteredDeals(deals.filter(deal => deal.addr.toLowerCase().includes(filterText.toLowerCase())));
  }, [filterText, deals]);

  async function syncDeals() {
    const dummyDeals: UserDealType[] = [
      { addr: '0x123aladkaljdkajdabc', status: 'Active', price: 15.5, remainingStorage: 100, remainingDuration: '30 days', timestamp: '2024-04-01 12:00:00' },
      { addr: '0x456...def', status: 'Cancelled', price: 10, timestamp: '2024-03-28 10:30:00', cancelReason: 'Provider unresponsive' },
      { addr: '0x789...ghi', status: 'Completed', price: 20, timestamp: '2024-02-20 08:15:00' },
      { addr: '0x321...jkl', status: 'Waiting for Approval', price: 25, timestamp: '2024-03-20 12:00:00', cancelReason: 'Pending review' },
      { addr: '0x123aladkaljdkajdabc', status: 'Active', price: 15.5, remainingStorage: 100, remainingDuration: '30 days', timestamp: '2024-04-01 12:00:00' },
      { addr: '0x456...def', status: 'Cancelled', price: 10, timestamp: '2024-03-28 10:30:00', cancelReason: 'Provider unresponsive' },
      { addr: '0x789...ghi', status: 'Completed', price: 20, timestamp: '2024-02-20 08:15:00' },
      { addr: '0x321...jkl', status: 'Waiting for Approval', price: 25, timestamp: '2024-03-20 12:00:00', cancelReason: 'Pending review' },
    ];
    setDeals(dummyDeals);
  }

  const columns = useMemo(
    () => [
      { header: 'Provider Address', accessorKey: 'addr' },
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
              {(status === 'Cancelled' || status === 'Waiting for Approval') && row.original.cancelReason && (
                <div className="relative group inline-block ml-2">
                  <FaInfoCircle size={16} color="#777" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block transition-opacity duration-150 rounded-md bg-gray-100 p-2 text-xs text-gray-800 shadow-lg whitespace-nowrap">
                    {row.original.cancelReason}
                  </div>
                </div>
              )}
            </div>
          );
        }
      },
      { header: 'Price ($)', accessorKey: 'price' },
      {
        header: 'Remaining Storage (GB)',
        accessorFn: (row: UserDealType) => (row.status === 'Active' ? row.remainingStorage ?? 'N/A' : 'N/A'),
      },
      {
        header: 'Remaining Duration',
        accessorFn: (row: UserDealType) => (row.status === 'Active' ? row.remainingDuration ?? 'N/A' : 'N/A'),
      },
      { header: 'Timestamp', accessorKey: 'timestamp' },
      {
        header: 'Action',
        cell: ({ row }: { row: any }) => {
          const isActive = row.original.status === 'Active';
          return (
            <Button
              variant="outline"
              disabled={!isActive}
              className={`px-4 ${!isActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              Upload
            </Button>
          );
        },
      },
    ],
    []
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
