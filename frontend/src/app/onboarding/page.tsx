"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"; // Make sure you have an Input component

export default function Onboarding() {
  const [isClient, setIsClient] = useState(false);
  const { isConnected } = useAccount();
  const [role, setRole] = useState<"provider" | "user" | null>(null);
  const [error, setError] = useState("");
  const [fadeError, setFadeError] = useState(false);

  const [ipfsAddress, setIpfsAddress] = useState("");
  const [maxStorage, setMaxStorage] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  function handleSelection(newRole: "provider" | "user") {
    setRole(newRole);
  }

  function handleContinue() {
    if (!isConnected) {
      setError("⚠ Connect your wallet first to proceed!");
      setFadeError(true);
      setTimeout(() => {
        setFadeError(false);
        setTimeout(() => setError(""), 500);
      }, 2000);
      return;
    }

    if (!role) {
      setError("⚠ Please select a role to proceed!");
      setFadeError(true);
      setTimeout(() => {
        setFadeError(false);
        setTimeout(() => setError(""), 500);
      }, 2000);
      return;
    }

    console.log("Proceeding with role:", role);
    // Further logic to navigate or save the role selection goes here.
  }

  function handleProviderSubmit() {
    // Handle provider form submission logic here
    console.log({
      ipfsAddress,
      maxStorage,
      price,
      duration,
    });
  }

  if (!isClient) return null;

  return (
    <div className="flex justify-center min-h-screen">
      <div className="relative w-full">
        <Card className="m-4 mt-8 lg:w-11/12 max-w-[1600px] max-xl:max-w-full h-fit">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2 flex-wrap font-normal">
              <div className="flex justify-between items-center w-full flex-wrap gap-2">
                <span className="font-bold text-lg">Onboarding</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 items-center p-8">
            {/* Wallet Connection */}
            <div className="flex flex-col items-center gap-2">
              <ConnectKitButton />
              {!isConnected && (
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Connect your wallet to continue.
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="w-full flex flex-col items-center gap-4">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Are you a provider or user?
              </p>
              <div className="flex gap-6">
                {["provider", "user"].map((option) => (
                  <Button
                    key={option}
                    variant={role === option ? "default" : "outline"}
                    className={cn(
                      "flex items-center gap-3 px-8 py-3 text-lg transition-all"
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
                    {option === "provider" ? "🌐 Provider" : "👤 User"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Provider Onboarding Form */}
            {role === "provider" && (
              <div className="flex flex-col gap-4 w-full">
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
                  placeholder="Price ($)"
                  className="w-full"
                />
                <Button
                  variant="default"
                  className="w-60 py-3 text-lg font-semibold mt-4"
                  onClick={handleProviderSubmit}
                >
                  Submit Provider Details
                </Button>
              </div>
            )}

            {/* Continue Button */}
            <Button
              variant="default"
              className="w-60 py-3 text-lg font-semibold mt-4 transition-all"
              onClick={handleContinue}
            >
              Continue
            </Button>

            {/* Inline Error Message (below the Continue button) */}
            {error && (
              <div
                className={`mt-2 text-red-600 text-sm font-semibold transition-opacity ${
                  fadeError ? "opacity-100" : "opacity-0"
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
