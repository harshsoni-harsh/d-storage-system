'use client'
import { useState } from "react";
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
import { DealDialogProps } from "@/types/types";

export default function DealDialog({ peer, addr, price, onCreateDeal, text }: DealDialogProps) {
    const [duration, setDuration] = useState('');
    const [storageSize, setStorageSize] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Dummy buyer address (common for all)
    const buyerAddr = "QmVtZXN0ZXJzUG9vcnQxMjM=";

    // Regex patterns
    const numberRegex = /^\d+(\.\d{1,2})?$/; // Integer or float (up to 2 decimals)
    const integerRegex = /^\d+$/; // Strict integer

    // Validation check
    const isValid = integerRegex.test(duration) && numberRegex.test(storageSize);

    const handleCreateDeal = async () => {
        if (isValid) {
            await onCreateDeal({duration, storageSize});
            setIsDialogOpen(false); // Close dialog after deal creation
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={'outline'}
                    className="text-white"
                    onClick={() => setIsDialogOpen(true)}
                >
                    {text || "Create Deal"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-fit max-w-full">
                <DialogHeader className="max-w-full overflow-hidden">
                    <DialogTitle>Confirm Deal Details</DialogTitle>
                    <DialogDescription>
                        Please review the details of your deal before confirming.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <p><strong>Buyer Address:</strong> {buyerAddr}</p>
                    <p><strong>Provider Address:</strong> {addr}</p>
                    <p><strong>Provider Peer ID:</strong> {peer}</p>
                    <p><strong>Price:</strong> {price}</p>

                    <div>
                        <label htmlFor="storage-size" className="block text-sm font-medium text-gray-300">Storage Size (GB)</label>
                        <Input
                            id="storage-size"
                            type="text"
                            value={storageSize}
                            onChange={(e) => setStorageSize(e.target.value)}
                            placeholder="Enter storage size (e.g. 10 or 10.50)"
                            className="mt-1"
                        />
                        {!numberRegex.test(storageSize) && storageSize !== '' && (
                            <p className="text-red-500 text-sm">Must be an integer or a number with up to 2 decimals</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duration (Days)</label>
                        <Input
                            id="duration"
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Enter duration in days (e.g. 30)"
                            className="mt-1"
                        />
                        {!integerRegex.test(duration) && duration !== '' && (
                            <p className="text-red-500 text-sm">Must be a valid integer</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant={'outline'}
                        disabled={!isValid}
                        onClick={handleCreateDeal}
                        className="text-white"
                    >
                        Create Deal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
