import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Web3Provider } from "../components/providers/WalletProvider"; // Adjust path as needed
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D Storage System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <main className="w-full">
                <SidebarTrigger className="absolute dark:bg-zinc-900 rounded-l-none opacity-50 hover:opacity-100 focus:opacity-100 transition duration-300" />
                {children}
              </main>
            </SidebarProvider>
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
