"use client";
import ProviderDeals from "@/components/ProviderDeals";
import UserDeals from "@/components/UserDeals";
import { useState } from "react";

export default function Main() {
  const [type, setType] = useState<"user" | "provider">("provider");

  return (
    <div className="flex flex-col items-center size-full">
      {type === "user" ? <UserDeals /> : <ProviderDeals />}
    </div>
  );
}
