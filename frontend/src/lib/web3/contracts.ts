import { DealABI, MarketplaceABI, ProviderABI } from "@/lib/abi";
import { getContract, isAddress } from "viem";
import { AddressType } from "@/types/types";
import { ensureChain } from "./utils";

const MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;

export async  function getMarketplaceContract() {
  if (!MARKETPLACE_CONTRACT || !isAddress(MARKETPLACE_CONTRACT))
    throw new Error("Invalid address");
  const { publicClient, walletClient } = await ensureChain();

  if (!walletClient) throw new Error("Wallet Client not found");

  return getContract({
    abi: MarketplaceABI,
    address: MARKETPLACE_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
}

export async function getProviderContract(PROVIDER_CONTRACT: AddressType) {
  const { publicClient, walletClient } = await ensureChain();
  if (!PROVIDER_CONTRACT || !isAddress(PROVIDER_CONTRACT) || !walletClient)
    throw new Error("contract or walletClient not found");
  return getContract({
    abi: ProviderABI,
    address: PROVIDER_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
}

export async function getDealContract(DEAL_CONTRACT: AddressType) {
  const { publicClient, walletClient } = await ensureChain();
  if (!DEAL_CONTRACT || !isAddress(DEAL_CONTRACT) || !walletClient)
    throw new Error("contract or walletClient not found");
  return getContract({
    abi: DealABI,
    address: DEAL_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
}