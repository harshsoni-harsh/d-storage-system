"use client";
import ProviderDeals from "@/components/ProviderDeals";
import UserDeals from "@/components/UserDeals";
import { useEffect, useState } from "react";

export default function Main() {
  const [type, setType] = useState<"user" | "provider" | null>(null);

  useEffect(() => {
    const cookies = document.cookie
      .split("; ")
      .reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

    const storedRole = cookies["userRole"];

    if (storedRole === "provider" || storedRole === "user") {
      setType(storedRole as "provider" | "user");
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
