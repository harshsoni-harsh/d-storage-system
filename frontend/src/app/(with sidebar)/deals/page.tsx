"use client";
import { useState, useEffect } from "react";
import UserDeals from "@/components/UserDeals";
import ProviderDeals from "@/components/ProviderDeals";

export default function Main() {
  const [type, setType] = useState<"user" | "provider">("user");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "provider" || storedRole === "user") {
      setType(storedRole);
    }
  }, []);

  return (
    <div className="flex flex-col items-center size-full">
      {type === "user" ? (
        <UserDeals />
      ) : type == "provider" ? (
        <ProviderDeals />
      ) : null}
    </div>
  );
}
