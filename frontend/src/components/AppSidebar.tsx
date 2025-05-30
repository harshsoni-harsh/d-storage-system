"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ConnectKitButton } from "connectkit";
import { CircuitBoard, Home } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggler";

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
    url: "/storage-providers",
    icon: CircuitBoard,
  },
  {
    title: "Deals",
    url: "/deals",
    icon: CircuitBoard,
  },
];

export function AppSidebar() {
  const { theme } = useTheme() as { theme: "light" | "dark" | undefined };
  const path = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="mx-auto mt-2">
        <ConnectKitButton mode={theme} />
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
                      <SidebarMenuButton asChild isActive={path === item.url}>
                        <Link
                          href={trimmedUrl}
                          className="flex items-center space-x-2"
                        >
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
      <SidebarFooter className="mx-2 mb-2">
        <ThemeToggle />
        <Link href="/onboarding">
          <SidebarMenuButton>Go to Onboarding</SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
