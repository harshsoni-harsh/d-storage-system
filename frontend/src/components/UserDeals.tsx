'use client'
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from '@/components/ReactTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";  
import { FaInfoCircle } from 'react-icons/fa';  
import { fetchUserDeals , fetchDealDetails} from '@/lib/web3';
import  {AddressType , UserDealType} from '@/types/types';

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
  try{
    const deals = await fetchUserDeals();
      console.log(deals);
      const detailedDeals =  await Promise.all(
        deals.map(async (dealAddress: AddressType) : Promise<UserDealType> => { 
          const details = await fetchDealDetails(dealAddress);
          let status: UserDealType['status'] = 'Active';
          if (details.completed) status = 'Completed';
          else if (!details.isActive) status = 'Waiting for Approval';
          
          return({
            addr: dealAddress,
            status: status,
            price: Number(details.pricePerSector),
            remainingStorage: Number(details.sectorCount),
            validTill: Number(details.validTill)
          }as UserDealType);
        }
      )
    )
    setDeals(detailedDeals);
    } catch (error) {
      console.error('Error syncing deals:', error);
  
    }
}
  const columns = useMemo(
    () => [
      { header: 'Deal Address', accessorKey: 'addr' },
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
        accessorFn: (row: UserDealType) => row.remainingStorage ?? 'N/A',
      },
      {
        header: 'Valid Till',
        accessorFn: (row: UserDealType) => {
          const date = new Date(row.validTill * 1000);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
        
      },
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
