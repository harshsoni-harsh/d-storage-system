"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getIpfsAddress } from "@/app/actions";
import { registerProvider } from "@/lib/contract-interactions";

export default function Onboarding() {
  const [isClient, setIsClient] = useState(true);
  const { isConnected } = useAccount();
  const [role, setRole] = useState<"provider" | "user">("user");
  const [error, setError] = useState("");
  const [fadeError, setFadeError] = useState(false);

  const [ipfsAddress, setIpfsAddress] = useState("");
  const [maxStorage, setMaxStorage] = useState("");
  const [price, setPrice] = useState("");

  const router = useRouter();

  const showError = (msg: string) => {
    setError(msg);
    setFadeError(true);
    setTimeout(() => {
      setFadeError(false);
    }, 2000);
  }

  useEffect(() => {
    setIsClient(true);
    (async function () {
      const { addresses } = await getIpfsAddress();
      setIpfsAddress(addresses[0] ?? '')
    })()
    localStorage.setItem("isOnboardingDone", "false")
  }, []);

  function handleSelection(newRole: "provider" | "user") {
    setRole(newRole);
  }

  if (!isClient) return null;

  function handleContinue() {
    if (!isConnected) {
      showError("Connect your wallet first to proceed!");
    } else {
      localStorage.setItem("isOnboardingDone", "true");
      router.replace("/");
    }
  }

  async function handleProviderSubmit() {
    try {
      if (!ipfsAddress || !price || !maxStorage) throw new Error("Please fill all values");
      await registerProvider(
        ipfsAddress,
        BigInt(maxStorage),
        BigInt(price)
      );
    } catch (err) {
      console.log(err);
      showError("Error registering provider");
    } finally {
      localStorage.setItem("isOnboardingDone", "true");
      router.replace("/");
    }
  }


  return (
    <div className="flex justify-center min-h-screen">
      <div className="relative">
        <Card className="m-4 mt-8 lg:w-11/12 max-w-[1600px] max-xl:max-w-full h-fit">
          <CardHeader>
            <CardTitle className="w-full text-center text-2xl py-4">
              <div className="font-bold">
                Onboarding
              </div>
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
                      role === option ? 'bg-zinc-400' : ''
                    )}
                    onClick={() => handleSelection(option as "provider" | "user")}
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
                  value={maxStorage}
                  onChange={(e) => setMaxStorage(e.target.value)}
                  placeholder="Max Storage Size (GB)"
                  className="w-full"
                />
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price per GB (ETH)"
                  className="w-full"
                />
                <Button
                  variant="secondary"
                  className="w-60 py-3 text-lg mt-4"
                  onClick={handleProviderSubmit}
                >
                  Submit Provider Details
                </Button>
              </div>
            )}

            {/* Continue Button */}
            {role === "user" && <Button
              variant="secondary"
              className="w-60 py-3 text-lg mt-4 transition-all"
              onClick={handleContinue}
            >
              Continue
            </Button>}

            {/* Inline Error Message (below the Continue button) */}
            {error && (
              <div
                className={`mt-2 text-red-600 text-sm font-semibold transition-opacity ${fadeError ? "opacity-100" : "opacity-0"
                  }`}
                style={{ transition: "opacity 1s" }}
              >
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
