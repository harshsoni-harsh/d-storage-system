import { pinCID } from "@/app/actions";
import { DealABI } from "@/lib/abi";
import type { AddressType, DealType } from "@/types/types";
import { WatchContractEventReturnType } from "viem";
import {
  getDealContract,
  getMarketplaceContract,
  getProviderContract,
} from "./contracts";
import { currentChain, ensureChain } from "./utils";
import { getAccount } from "./web3-clients";

export async function fetchDealDetails(dealAddress: AddressType) {
  const dealContract = await getDealContract(dealAddress);
  const [
    userAddress,
    providerAddress,
    pricePerSector,
    sectorCount,
    validTill,
    isActive,
    completed,
  ] = await dealContract.read.getDealInfo();

  return {
    userAddress,
    providerAddress,
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
    { account },
  );
  await walletClient.writeContract(request);
}

export async function addCID(dealAddress: AddressType, cid: string) {
  const dealContract = await getDealContract(dealAddress);
  const account = await getAccount();
  await dealContract.write.addCID([cid], { account, chain: currentChain });
}

export async function getCIDs(dealAddress: AddressType) {
  const dealContract = await getDealContract(dealAddress);
  const cids = await dealContract.read.getAllCIDs();
  return cids;
}

export async function listenDeals(
  deals: DealType[],
): Promise<WatchContractEventReturnType[]> {
  const { publicClient } = await ensureChain();

  return deals.map((deal) => {
    return publicClient.watchContractEvent({
      address: `${deal.dealAddr}`,
      abi: DealABI,
      eventName: "CIDAdded",
      onLogs: async (logs) => {
        for (const log of logs) {
          const cid = log.args.cid;
          if (cid) {
            console.log(`pinning ${cid}`);
            try {
              await pinCID(cid);
            } catch (err) {
              console.error(
                `Error pinning ${cid}`,
                err instanceof Error ? err.message : err,
              );
            }
          }
        }
      },
    });
  });
}
