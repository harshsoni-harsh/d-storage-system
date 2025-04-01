import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "D Storage System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger className="absolute dark:bg-zinc-900 rounded-l-none opacity-50 hover:opacity-100 focus:opacity-100 transition duration-300" />
        {children}
      </main>
    </SidebarProvider>
  );
}
