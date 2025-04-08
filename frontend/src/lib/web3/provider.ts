import type { AddressType, ProviderType } from "@/types/types";
import { formatEther, isAddressEqual, zeroAddress } from "viem";
import { getMarketplaceContract, getProviderContract } from "./contracts";
import { currentChain, ensureChain } from "./utils";
import { getAccount } from "./web3-clients";

export async function fetchProviderDeals(providerAddress?: AddressType) {
  if (!providerAddress) {
    const account = await getAccount();
    const marketplaceContract = await getMarketplaceContract();
    const providerInstance = await marketplaceContract.read.provider_instances([
      account,
    ]);
    if (!isAddressEqual(providerInstance, zeroAddress)) {
      const providerContract = await getProviderContract(providerInstance);
      return await providerContract.read.getAllDeals();
    }
    throw new Error("You are not a provider");
  }
  const providerContract = await getProviderContract(providerAddress);
  return await providerContract.read.getAllDeals();
}

export async function getProviderDetails(
  providerAddress: AddressType,
): Promise<ProviderType> {
  const contract = await getProviderContract(providerAddress);
  const [walletAddress, pricePerSector, sectorCount, validTill, ipfsPeerId] =
    await contract.read.getProviderInfo();

  return {
    providerAddress: walletAddress,
    pricePerSector: formatEther(pricePerSector),
    sectorCount: Number(sectorCount).toString(),
    validTill: Number(validTill).toString(),
    ipfsPeerId,
  };
}

export async function releasePayment(userAddress: AddressType): Promise<void> {
  const account = await getAccount();
  if (!account || !userAddress) {
    throw new Error("Both provider and user addresses are required.");
  }

  const marketplaceContract = await getMarketplaceContract();

  try {
    await marketplaceContract.write.releasePayment([account, userAddress], {
      account,
      chain: currentChain,
    });
    console.log("Payment released successfully");
  } catch (err) {
    console.error("Failed to release payment:", err);
    throw err;
  }
}
