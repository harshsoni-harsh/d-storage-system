'use client'
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from '@/components/ReactTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DealDialog from "@/components/ui/ConnectionDialogCreateDeal"
import { initiateDeal, getProviderDetails, getProviders } from '@/lib/web3';
import { PeerType, ProviderType } from '@/types/types';
import { getPeerLatency, getPeerStats } from '@/app/actions';

const intervals = [250, 500, 750, 1000, 2000, 5000];

const API_BASE_URL = "http://localhost:3002";

export default function Page() {
  const [providers, setProviders] = useState<ProviderType[]>([]);
  const [peers, setPeers] = useState<PeerType[]>([]);
  const [filteredPeers, setFilteredPeers] = useState<PeerType[]>([]);
  const [filterText, setFilterText] = useState<string>('');
  const [syncInterval, setSyncInterval] = useState<number>(0);

  useEffect(() => {
    syncProviders();
  }, []);

  useEffect(() => {
    if (!filterText) setFilteredPeers(peers);
  }, [peers]);

  useEffect(() => {
    if (syncInterval !== 0) {
      const intervalId = setInterval(async () => {
        await syncPeers();
      }, syncInterval);
      return () => clearInterval(intervalId);
    }
  }, [syncInterval]);

  useEffect(() => {
    setFilteredPeers(peers.filter(peer => (
      peer.addr.toLowerCase().includes(filterText.toLowerCase()) ||
      peer.peer.toLowerCase().includes(filterText.toLowerCase())
    )))
  }, [filterText]);

  async function syncProviders() {
    const providers = await getProviders();
    if (Array.isArray(providers)) {
      const providersDetails = await Promise.all(providers.map(async (provider) => {
        return await getProviderDetails(provider);
      })) as ProviderType[];
      setProviders(providersDetails);
      await syncPeers(providersDetails);
    }
  }
  async function syncPeers(providersProp?: ProviderType[]) {
    const providerData = providersProp ?? providers ?? [];
    const peers = await Promise.all(providerData.map(async (provider) => {
      const peerId = provider.ipfsPeerId.split('/').at(-1) ?? '';
      const addr = provider.ipfsPeerId.split('/').at(2) ?? '';
      const latency = await getPeerLatency(peerId);
      return ({
        addr,
        walletAddress: provider.providerAddress,
        peer: peerId,
        latency,
        maxStorage: provider.sectorCount,
        price: provider.pricePerSector,
        validTill: provider.validTill
      })
    })) as PeerType[];
    setPeers(peers);
  }

  const columns = useMemo(
    () => [
      {
        header: 'Address',
        accessorKey: 'addr',
      },
      {
        header: 'Latency',
        accessorFn: (row: any) => {
          const value = row.latency;
          if (typeof value === 'string') {
            if (value.endsWith('ms')) {
              return parseFloat(value);
            } else if (value.endsWith('s')) {
              return parseFloat(value) * 1000;
            }
          }
          return 0;
        },
        cell: ({ row }: { row: any }) => `${row.original.latency}`,
      },
      {
        header: 'Provider Wallet',
        accessorKey: 'walletAddress',
      },
      {
        header: 'Max Storage',
        accessorKey: 'maxStorage',
        cell: ({ row }: { row: any }) => `${row.original.maxStorage} GB`
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }: { row: any }) => `${row.original.price} ETH`,
      },
      {
        header: 'Valid Till',
        accessorKey: 'validTill',
        cell: ({ row }: { row: any }) => `${new Date(Number(row.original.validTill) * 1000).toLocaleString()}`,
      },
      {
        header: 'Action',
        cell: ({ row }: { row: any }) => (
          <DealDialog
            peer={row.original.peer}
            addr={row.original.addr}
            price={row.original.price}
            onCreateDeal={async ({duration, storageSize}: {duration: number, storageSize: number}) => {
              await initiateDeal(row.original.walletAddress, storageSize, duration, storageSize * Number(row.original.price));
            }}
          />
        ),
      },
    ],
    []
  );


  const handleCreateDeal = (peer: string) => {
    alert(`Deal created with ${peer}`);
    // Handle the logic for creating a deal here
  };

  return (
    <div className="flex justify-center size-full">
      <Card className="m-4 mt-8 lg:w-11/12 max-w-[1600px] max-xl:max-w-full h-fit">
        <CardHeader>
          <CardTitle className="flex justify-between gap-2 flex-wrap font-normal">
            <div className="flex justify-between items-center w-full flex-wrap gap-2">
              <span className="font-bold text-lg">Providers</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center flex-wrap mb-2">
            <div className="relative flex items-center">
              <Input
                className="w-60 font-normal"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                placeholder="Filter Providers..."
              />
              <span className="absolute z-10 right-2 opacity-60 text-sm">{filteredPeers?.length}</span>
            </div>
            <Select onValueChange={val => setSyncInterval(parseInt(val))} value={`${syncInterval}`}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Sync Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'0'}>Manual Sync</SelectItem>
                {
                  intervals.map(interval => (
                    <SelectItem key={interval} value={`${interval}`}>{interval} ms</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            <Button variant={'outline'} className="w-8 p-0" onClick={() => syncPeers()}>
              <Image src='/icons/sync.svg' height={16} width={16} alt='Sync' className="dark:invert" />
            </Button>
          </div>
          <ReactTable data={filteredPeers} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
