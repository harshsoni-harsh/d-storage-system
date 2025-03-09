import {
  CircuitBoard,
  Home,
} from "lucide-react";

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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
