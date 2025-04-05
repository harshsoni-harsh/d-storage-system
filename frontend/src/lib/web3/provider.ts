import { AddressType, ProviderType } from "@/types/types";
import { getMarketplaceContract, getProviderContract } from "./contracts";
import { getAccount } from "./web3-clients";
import { isAddressEqual, zeroAddress } from "viem";

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
  } else {
    const providerContract = await getProviderContract(providerAddress);
    return await providerContract.read.getAllDeals();
  }
}

export async function getProviderDetails(
  providerAddress: AddressType
): Promise<ProviderType> {
  const contract = await getProviderContract(providerAddress);
  const [walletAddress, pricePerSector, sectorCount, validTill, ipfsPeerId] =
    await contract.read.getProviderInfo();

  return {
    providerAddress: walletAddress,
    pricePerSector: Number(pricePerSector).toString(),
    sectorCount: Number(sectorCount).toString(),
    validTill: Number(validTill).toString(),
    ipfsPeerId,
  };
}