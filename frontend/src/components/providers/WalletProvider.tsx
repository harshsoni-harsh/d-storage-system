"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { http, WagmiProvider, createConfig } from "wagmi";
import { type Chain, mainnet, sepolia } from "wagmi/chains";

const queryClient = new QueryClient();

const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
const HARDHAT_RPC_URL = process.env.NEXT_PUBLIC_HARDHAT_RPC_URL;

if (!MAINNET_RPC_URL || !SEPOLIA_RPC_URL || !HARDHAT_RPC_URL) {
  throw new Error("One or more RPC URLs are not defined");
}

const hardhat: Chain & { network: string } = {
  id: 31337,
  name: "Hardhat",
  network: "hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [HARDHAT_RPC_URL] },
  },
};

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!walletConnectProjectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined");
}

const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  transports: {
    [mainnet.id]: http(MAINNET_RPC_URL),
    [sepolia.id]: http(SEPOLIA_RPC_URL),
    [hardhat.id]: http(HARDHAT_RPC_URL),
  },
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
