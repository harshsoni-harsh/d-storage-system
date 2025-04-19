"use client";

import { Toaster } from "../ui/sonner";
import { ThemeProvider } from "./ThemeProvider";
import { Web3Provider } from "./WalletProvider";

export default function ClientProviders({
  children,
}: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      <Toaster />
    </Web3Provider>
  );
}
