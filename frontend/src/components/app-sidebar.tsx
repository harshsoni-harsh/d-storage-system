"use client";

import { CircuitBoard, Home } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import ThemeToggle from "./theme-toggler";
import ConnectButton from "@/components/custombuttonconnectkit"; // Use the custom ConnectKit button

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Connections",
    url: "/connections",
    icon: CircuitBoard,
  },
  {
    title: "Storage Providers",
    url: "/",
    icon: CircuitBoard,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <ThemeToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const trimmedUrl = item.url ? item.url.trim() : "";
                return (
                  <SidebarMenuItem key={item.title}>
                    {trimmedUrl !== "" ? (
                      <SidebarMenuButton asChild>
                        <Link href={trimmedUrl} className="flex items-center space-x-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4">
        <ConnectButton /> {/* Custom ConnectKit button with styling */}
      </div>
    </Sidebar>
  );
}
