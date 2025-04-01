'use client'

import { Button } from "@/components/ui/button";
import { createDeal, fetchProviderDeals, getProviders, registerProvider } from "@/lib/contract-interactions";
import { useEffect, useState } from "react";

export default function Page() {
    const [data, setData] = useState<any>();
    async function fetch() {
        setData("Loading")
        const providers = await getProviders();
        setData({providers});
        if (Array.isArray(providers))
            providers.forEach(async (provider) => {
                const deals = await fetchProviderDeals(provider);
                setData((prev: any) => ({
                    ...prev,
                    [`${provider}-deals`]: deals,
                }))
            })
    }
    useEffect(() => {
        fetch()
    }, [])
    return (
        <>
            <div className="flex gap-2 mt-20">
                <Button onClick={() => {
                    registerProvider("12D3KooWRzeKiV9MXFG1mFW5bjWQZqRkVgXCMcWtV3aXLbSYfo4n", BigInt(12431), BigInt(325))
                }}>Register provider</Button>
                <Button onClick={() => {
                    createDeal("0xa16E02E87b7454126E5E10d957A927A7F5B5d2be", BigInt(12431), BigInt(325))
                }}>Create deal</Button>
                <Button onClick={fetch}>Get providers</Button>
            </div>
            <pre>
                Contents:
                {JSON.stringify(data, null, 4)}
            </pre>
        </>

    )
}