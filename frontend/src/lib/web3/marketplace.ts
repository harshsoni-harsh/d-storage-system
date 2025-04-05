import { currentChain, ensureChain } from "./utils";
import { getMarketplaceContract } from "./contracts";
import { getAccount } from "./web3-clients";
import { AddressType } from "@/types/types";
import { isAddress, parseEther } from "viem";

export async function registerProvider(
  peerId: string,
  sectorCount: number,
  pricePerSector: number
) {
  const contract = await getMarketplaceContract();
  const account = await getAccount();

  const hash = await contract.write.registerProvider(
    [peerId, BigInt(sectorCount), BigInt(pricePerSector)],
    { account, chain: currentChain }
  );
  return hash;
}

export async function fetchUserDeals() {
  const marketplaceContract = await getMarketplaceContract();
  return await marketplaceContract.read.getUserDeals();
}

export async function getProviders() {
  const contract = await getMarketplaceContract();
  return await contract.read.getAllProviders();
}

export async function initiateDeal(
  providerAddress: AddressType,
  fileSize: number,
  duration: number,
  amount: number
) {
  const { publicClient } = await ensureChain();
  const marketplaceContract = await getMarketplaceContract();
  const account = await getAccount();

  try {
    const hash = await marketplaceContract.write.initiateDeal([
      providerAddress,
      BigInt(fileSize),
      BigInt(duration),
    ], {
      account,
      value: parseEther(amount.toString()),
      chain: currentChain
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed:", receipt);
    return true;
  } catch (err: any) {
    if (err.message.includes("revert")) {
      const revertReason = err.message.match(/revert (.+)/);
      console.log("Revert Reason:", revertReason?.[1] || err.message);
    } else {
      throw new Error("Can't create deal with this provider", err);
    }
  }
}
