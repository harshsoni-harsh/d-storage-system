"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Initialize Wagmi & Query Client
const queryClient = new QueryClient();

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
if (!alchemyId) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_ID is not defined");
}

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!walletConnectProjectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined");
}

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`
      ),
    },
    walletConnectProjectId,
    appName: "D Storage System",
    appDescription: "A decentralized storage system using Web3",
    appUrl: "http://localhost:3000",
    appIcon: "../../../public/vercel.svg",
  })
);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
