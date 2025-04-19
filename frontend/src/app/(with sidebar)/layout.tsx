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
      <main className="relative grow shrink min-h-full overflow-auto">
        <SidebarTrigger className="fixed top-0 dark:bg-zinc-900 rounded-l-none opacity-50 hover:opacity-100 focus:opacity-100 transition duration-300" />
        {children}
      </main>
    </SidebarProvider>
  );
}
