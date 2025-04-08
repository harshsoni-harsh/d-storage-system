import type { AddressType } from "@/types/types";
import { isAddress, parseEther } from "viem";
import { getMarketplaceContract } from "./contracts";
import { currentChain, ensureChain } from "./utils";
import { getAccount } from "./web3-clients";

export async function registerProvider(
  peerId: string,
  sectorCount: number,
  pricePerSector: number,
) {
  const contract = await getMarketplaceContract();
  const account = await getAccount();

  const hash = await contract.write.registerProvider(
    [peerId, BigInt(sectorCount), BigInt(pricePerSector)],
    { account, chain: currentChain },
  );
  return hash;
}

export async function fetchUserDeals() {
  const marketplaceContract = await getMarketplaceContract();
  const deals = await marketplaceContract.read.getUserDeals();
  console.log({ deals });
  return deals;
}

export async function getProviders() {
  const contract = await getMarketplaceContract();
  return await contract.read.getAllProviders();
}

export async function initiateDeal(
  providerAddress: AddressType,
  fileSize: number,
  duration: number,
  amount: number,
) {
  const { publicClient, walletClient } = await ensureChain();
  const marketplaceContract = await getMarketplaceContract();
  const account = await getAccount();

  try {
    const { request } = await marketplaceContract.simulate.initiateDeal(
      [providerAddress, BigInt(fileSize), BigInt(duration)],
      {
        account,
        value: parseEther(amount.toString()),
      },
    );
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed:", receipt);
    return true;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("revert")) {
        const revertReason = err.message.match(/revert (.+)/);
        console.log("Revert Reason:", revertReason?.[1] || err.message);
        throw err.message;
      }
      throw err.message;
    }
    throw new Error("Can't create deal with this provider");
  }
}
