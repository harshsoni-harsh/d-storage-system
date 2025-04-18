"use client";

import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { getIpfsAddress } from "@/app/actions";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { registerProvider } from "@/lib/web3";
import { toast } from "sonner";

export default function Onboarding() {
  const [isClient, setIsClient] = useState(true);
  const { isConnected } = useAccount();
  const [role, setRole] = useState<"provider" | "user">("user");

  const [ipfsAddress, setIpfsAddress] = useState("");
  const [maxStorage, setMaxStorage] = useState<number>(0);
  const [price, setPrice] = useState<number>(0.0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    (async () => {
      const { addresses } = await getIpfsAddress();
      setIpfsAddress(addresses[0] ?? "");
    })();
  }, []);

  function handleSelection(newRole: "provider" | "user") {
    setRole(newRole);
  }

  if (!isClient) return null;

  function handleContinue() {
    if (!isConnected) {
      toast.error("Connect your wallet first to proceed!");
    } else {
      document.cookie = "isOnboardingDone=true; path=/; max-age=31536000";
      document.cookie = "userRole=user; path=/; max-age=31536000";
      setLoading(true);
      window.location.href = "/";
    }
  }

  async function handleProviderSubmit() {
    try {
      if (!ipfsAddress || !price || !maxStorage)
        throw new Error("Please fill all values");
      await registerProvider(ipfsAddress, maxStorage, price);
      document.cookie = "isOnboardingDone=true; path=/; max-age=31536000";
      document.cookie = "userRole=provider; path=/; max-age=31536000";
      setLoading(true);
      window.location.href = "/";
    } catch (err) {
      console.log(err);
      toast.error("Error registering provider");
    }
  }

  return (
    <div className="flex justify-center min-h-screen">
      <div className="relative">
        <Card className="m-4 mt-8 lg:w-11/12 max-w-[1600px] max-xl:max-w-full h-fit">
          <CardHeader>
            <CardTitle className="w-full text-center text-2xl py-4">
              <div className="font-bold">Onboarding</div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 items-center p-8 pt-0">
            {/* Wallet Connection */}
            <div className="flex flex-col items-center gap-2">
              <ConnectKitButton />
            </div>

            {/* Role Selection */}
            <div className="w-full flex flex-col items-center gap-4">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Are you a storage provider or user?
              </p>
              <div className="flex gap-6">
                {["provider", "user"].map((option) => (
                  <Button
                    key={option}
                    variant={role === option ? "default" : "outline"}
                    className={cn(
                      "px-8 py-3 text-lg font-bold",
                      role === option ? "dark:bg-zinc-400" : "",
                    )}
                    onClick={() =>
                      handleSelection(option as "provider" | "user")
                    }
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option}
                      checked={role === option}
                      onChange={() =>
                        handleSelection(option as "provider" | "user")
                      }
                      className="hidden"
                    />
                    {option === "provider" ? "Provider" : "User"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Provider Onboarding Form */}
            {role === "provider" && (
              <div className="flex flex-col items-center gap-4 w-full">
                <Input
                  value={ipfsAddress}
                  onChange={(e) => setIpfsAddress(e.target.value)}
                  placeholder="IPFS Address"
                  className="w-full"
                />
                <Input
                  value={Number.isNaN(maxStorage) ? "" : String(maxStorage)}
                  type="number"
                  onChange={(e) =>
                    setMaxStorage(Number.parseFloat(e.target.value ?? "0"))
                  }
                  placeholder="Max Storage Size (GB)"
                  className="w-full"
                />
                <Input
                  value={Number.isNaN(price) ? "" : String(price)}
                  type="number"
                  onChange={(e) =>
                    setPrice(Number.parseFloat(e.target.value ?? "0"))
                  }
                  placeholder="Price per GB (ETH)"
                  className="w-full"
                />
                <Button
                  variant="secondary"
                  className="w-60 py-3 text-lg mt-4"
                  onClick={handleProviderSubmit}
                  disabled={Number.isNaN(maxStorage) || Number.isNaN(price)}
                >
                  Submit Provider Details
                </Button>
              </div>
            )}

            {/* Continue Button */}
            {role === "user" && (
              <Button
                variant="secondary"
                className="w-60 py-3 text-lg mt-4 transition-all"
                onClick={handleContinue}
              >
                Continue
              </Button>
            )}
          </CardContent>
          {loading && (
            <div className="pb-6">
              <Loader />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
