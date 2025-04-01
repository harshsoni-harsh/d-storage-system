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
import { getProviderDetails, getProviders } from '@/lib/contract-interactions';

type PeerType = {
  addr: string;
  peer: string;
  latency: string;
  maxStorage: string;
  price: string;
  duration: string;
}

type ProviderType = {
  pricePerSector: string;
  sectorCount: string;
  validTill: string;
  ipfsPeerId: string;
}

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
    syncPeers();
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
    console.log({providers})
    if (Array.isArray(providers)) {
      const providersDetails = await Promise.all(providers.map(async (provider) => {
        return await getProviderDetails(provider);
      })) as ProviderType[];
      console.log({providersDetails})
      setProviders(providersDetails);
    }
    await syncPeers();
  }
  async function syncPeers() {
    // Dummy data for peers
    // const dummyPeers: PeerType[] = [
    //   { addr: '192.168.0.1', peer: 'Peer A', latency: '120ms', maxStorage: '500GB', price: '$10/month', duration: '12 months' },
    //   { addr: '192.168.0.2', peer: 'Peer B', latency: '80ms', maxStorage: '1TB', price: '$20/month', duration: '6 months' },
    //   { addr: '192.168.0.3', peer: 'Peer C', latency: '150ms', maxStorage: '200GB', price: '$8/month', duration: '24 months' },
    //   { addr: '192.168.0.4', peer: 'Peer D', latency: '100ms', maxStorage: '2TB', price: '$30/month', duration: '18 months' },
    //   { addr: '192.168.0.5', peer: 'Peer E', latency: '60ms', maxStorage: '5TB', price: '$50/month', duration: '36 months' },
    // ];
    const peers = providers.map(provider => ({
      addr: '192.168.0.1',
      peer: provider.ipfsPeerId,
      latency: '100ms',
      maxStorage: provider.sectorCount,
      price: provider.pricePerSector,
      duration: provider.validTill
    })) as PeerType[];
    console.log({peers})
    // const peers = await Promise.all(providers?.map(async provider => {
    //   try {
    //     const response = await fetch(`${API_BASE_URL}/peers/?peerId=${provider.ipfsPeerId}`);
    //     const info = await response.json();
    //     return info;
    //   } catch (err) {
    //     console.error(err);
    //     throw err;
    //   }
    // })) as PeerType[];
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
        header: 'Provider ID',
        accessorKey: 'peer',
      },
      {
        header: 'Max Storage',
        accessorKey: 'maxStorage',
      },
      {
        header: 'Price',
        accessorKey: 'price',
      },
      {
        header: 'Duration',
        accessorKey: 'duration',
      },
      {
        header: 'Action',
        cell: ({ row }: { row: any }) => (
          <DealDialog
            peer={row.original.peer}
            addr={row.original.addr}
            price={row.original.price}
            onCreateDeal={(peer, addr, price, duration, storageSize) => {
              alert(`Deal Created with ${peer} at address ${addr} for ${price}, duration: ${duration}, storage: ${storageSize}`);
              // Implement further logic for handling deal creation
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
            <Button variant={'outline'} className="w-8 p-0" onClick={syncPeers}>
              <Image src='/icons/sync.svg' height={16} width={16} alt='Sync' className="dark:invert" />
            </Button>
          </div>
          <ReactTable data={filteredPeers} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
