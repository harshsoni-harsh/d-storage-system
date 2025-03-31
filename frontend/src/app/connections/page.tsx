'use client'
 import { fetchPeers } from "../actions";
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
 import ConnectionDialog from "@/components/ConnectionDialog";
 
 type peerType = {
   addr: string;
   peer: string;
 }
 
 const intervals = [250, 500, 750, 1000, 2000, 5000];
 
 export default function Page() {
   const [peers, setPeers] = useState<peerType[]>([]);
   const [filteredPeers, setFilteredPeers] = useState<peerType[]>([]);
   const [filterText, setFilterText] = useState<string>('');
   const [syncInterval, setSyncInterval] = useState<number>(500);
 
   useEffect(() => {
     syncPeers();
   }, [])
 
   useEffect(() => {
     if (!filterText) setFilteredPeers(peers);
   }, [peers]);
 
   useEffect(() => {
     if (syncInterval !== 0) {
       const it1 = setInterval(async () => {
         await syncPeers();
       }, syncInterval);
       return () => clearInterval(it1);
     }
   }, [syncInterval]);
 
   useEffect(() => {
     setFilteredPeers(peers.filter(peer => (
       peer.addr.toLowerCase().includes(filterText.toLowerCase()) ||
       peer.peer.toLowerCase().includes(filterText.toLowerCase())
     )))
   }, [filterText]);
 
   async function syncPeers() {
     const peers = await fetchPeers()
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
         cell: ({ row }: { row: any }) => `${row.original.latency}`
       },
       {
         header: 'Peer ID',
         accessorKey: 'peer',
       },
     ],
     []
   );
 
   return (
     <div className="flex justify-center size-full">
       <Card className="m-4 mt-8 lg:w-11/12 max-w-[1600px] max-xl:max-w-full h-fit">
         <CardHeader>
           <CardTitle className="flex justify-between gap-2 flex-wrap font-normal">
             <div className="flex justify-between items-center w-full flex-wrap gap-2">
               <span className="font-bold text-lg">Peers</span>
               <ConnectionDialog text={"Add peer"} />
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
                 placeholder="Filter Peers..."
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
   )
 }