"use client";
import { CircuitBoard, Home } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import Link from "next/link"; // Import Link from Next.js
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

const items = [
  {
    title: "Home",
    url: "/", // valid URL
    icon: Home,
  },
  {
    title: "Connections",
    url: "/connections", // valid URL
    icon: CircuitBoard,
  },
  {
    title: "Storage Providers",
    url: "/", // valid URL; if you want this non-clickable, set url to "" or null
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
                // Trim the URL to remove accidental whitespace
                const trimmedUrl = item.url ? item.url.trim() : "";
                // Log the URL for debugging
                console.log(`Rendering item: ${item.title} with URL: "${trimmedUrl}"`);
                return (
                  <SidebarMenuItem key={item.title}>
                    {trimmedUrl !== "" ? (
                      <SidebarMenuButton asChild>
                        <Link href={trimmedUrl}>
                          <div className="flex items-center space-x-2">
                            <item.icon />
                            <span>{item.title}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      // If URL is empty, render a non-clickable element.
                      <div className="flex items-center space-x-2">
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
        <ConnectKitButton />
      </div>
    </Sidebar>
  );
}
