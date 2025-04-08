import type { PublicClient, WalletClient } from "viem";
import { extractChain } from "viem";
import { getChainId, switchChain } from "viem/actions";
import { hardhat, mainnet, sepolia } from "viem/chains";
import { getPublicClient, getWalletClient } from "./web3-clients";

export const TARGET_CHAIN_ID = Number.parseInt(
  process.env.TARGET_CHAIN_ID ?? "31337",
);

type CheckChainResult =
  | { success: true }
  | { success: false; reason: string; needsSwitch: boolean };

export async function checkAndSwitchChain(
  publicClient: PublicClient,
  walletClient: WalletClient,
): Promise<CheckChainResult> {
  const currentChainId = await getChainId(publicClient);
  if (currentChainId === TARGET_CHAIN_ID) return { success: true };

  try {
    await switchChain(walletClient, { id: TARGET_CHAIN_ID });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      reason: err instanceof Error ? err.message : (err as string),
      needsSwitch: true,
    };
  }
}

export async function ensureChain(): Promise<{
  publicClient: PublicClient;
  walletClient: WalletClient;
}> {
  const publicClient = getPublicClient();
  const walletClient = getWalletClient();

  if (!walletClient) throw new Error("Wallet client not found");

  const result = await checkAndSwitchChain(publicClient, walletClient);
  if (!result.success) throw new Error(result.reason);

  return { publicClient, walletClient };
}

export const currentChain = extractChain({
  chains: [mainnet, sepolia, hardhat],
  id: TARGET_CHAIN_ID as 1 | 31337 | 11155111,
});
