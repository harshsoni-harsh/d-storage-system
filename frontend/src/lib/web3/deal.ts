import { AddressType } from "@/types/types";
import { ensureChain } from "./utils";
import {
  getDealContract,
  getMarketplaceContract,
  getProviderContract,
} from "./contracts";
import { getAccount } from "./web3-clients";

export async function fetchDealDetails(dealAddress: AddressType) {
  const dealContract = await getDealContract(dealAddress);
  const [pricePerSector, sectorCount, validTill, isActive, completed] =
    await dealContract.read.getDealInfo();

  return {
    pricePerSector,
    sectorCount,
    validTill,
    isActive,
    completed,
  };
}

export async function approveDeal(userAddress: AddressType) {
  const marketplaceContract = await getMarketplaceContract();
  const account = await getAccount();
  const { walletClient } = await ensureChain();
  const providerAddress = (await marketplaceContract.read.provider_instances([
    account,
  ])) as AddressType;

  if (!providerAddress) throw new Error("User is not a provider");
  const providerContract = await getProviderContract(providerAddress);
  const { request } = await providerContract.simulate.approveDeal(
    [userAddress],
    { account }
  );
  await walletClient.writeContract(request);
}
