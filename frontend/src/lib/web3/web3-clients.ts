"use client";

import { http, createPublicClient, createWalletClient, custom } from "viem";
import { hardhat, mainnet } from "viem/chains";

export const getPublicClient = () =>
  createPublicClient({
    chain: hardhat,
    transport: http(process.env.NEXT_PUBLIC_HARDHAT_RPC_URL ?? ""),
  });

const isEthereumAvailable =
  typeof window !== "undefined" && typeof window.ethereum !== "undefined";

// eg: Metamask
export const getWalletClient = () => {
  if (!isEthereumAvailable) return null;

  return createWalletClient({
    chain: hardhat,
    transport: custom(window.ethereum),
  });
};

export const getAccount = async () => {
  const walletClient = getWalletClient();
  if (!walletClient) {
    throw new Error(
      "Ethereum provider is not available. Please install Metamask or use a supported browser.",
    );
  }
  const [account] = await walletClient.getAddresses();
  return account;
};
