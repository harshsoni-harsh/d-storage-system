import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import "@/app/globals.css";
import { Web3Provider } from "../components/providers/WalletProvider";

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
      <body className="antialiased dark:text-zinc-200">
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Web3Provider>
        <Toaster />
      </body>
    </html>
  );
}
