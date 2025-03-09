'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { connectPeer } from "@/app/actions";

export default function ConnectionDialog({ text }: { text: string }) {
    const [addr, setAddr] = useState('');
    const addConnection = async () => {
        if (!addr) return;
        const res = await connectPeer(addr);
        console.log(res)
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{text}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-fit max-w-full">
                <DialogHeader className="max-w-full overflow-hidden">
                    <DialogTitle>Add Peer</DialogTitle>
                    <DialogDescription>
                        Insert the peer address you want to connect to.
                    </DialogDescription>
                </DialogHeader>
                <p className="truncate">Example: /ip4/192.3.44.231/tcp/4001/p2p/12D3KooWMayZxfV47NQ5dtJ8UTczc8oYPzD5WAhtVM6fy5qhfHcZ</p>
                <Input id="name" value={addr} onChange={e => setAddr(e.target.value)} className="ring-1 ring-zinc-600" />
                <DialogFooter>
                    <Button disabled={!addr} onClick={addConnection}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}