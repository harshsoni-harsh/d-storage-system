import { AddressType, ProviderType } from "@/types/types";
import { getProviderContract } from "./contracts";

export async function fetchProviderDeals(providerAddress: AddressType) {
  const providerContract = await getProviderContract(providerAddress);
  return await providerContract.read.getAllDeals();
}

export async function getProviderDetails(providerAddress: AddressType): Promise<ProviderType> {
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