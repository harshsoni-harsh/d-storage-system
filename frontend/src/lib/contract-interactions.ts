import { dealABI, marketplaceABI, providerABI } from "@/lib/abi";
import { getContract, isAddress } from "viem";
import { getAccount, publicClient, walletClient } from "./web3-clients";
import { AddressType, ProviderType } from "@/types/types";

const MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;

function getMarketplaceContract() {
  if (
    !MARKETPLACE_CONTRACT ||
    !isAddress(MARKETPLACE_CONTRACT) ||
    !walletClient
  )
    throw new Error("contract or walletClient not found");
  const contract = getContract({
    abi: marketplaceABI,
    address: MARKETPLACE_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
  return contract;
}

function getProviderContract(PROVIDER_CONTRACT: AddressType) {
  if (!PROVIDER_CONTRACT || !isAddress(PROVIDER_CONTRACT) || !walletClient)
    throw new Error("contract or walletClient not found");
  const contract = getContract({
    abi: providerABI,
    address: PROVIDER_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
  return contract;
}

function getDealContract(DEAL_CONTRACT: AddressType) {
  if (!DEAL_CONTRACT || !isAddress(DEAL_CONTRACT) || !walletClient)
    throw new Error("contract or walletClient not found");
  const contract = getContract({
    abi: dealABI,
    address: DEAL_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
  return contract;
}

export async function getProviders() {
  try {
    const contract = getMarketplaceContract();
    const providerList = await contract.read.getProviderList();
    return providerList;
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    throw err;
  }
}

export async function getProviderDetails(
  providerAddress: AddressType
): Promise<ProviderType> {
  try {
    const contract = getProviderContract(providerAddress);
    const walletAddress = (await contract.read.walletAddress()) as AddressType;
    const pricePerSector = (await contract.read.pricePerSector()) as string;
    const sectorCount = (await contract.read.sectorCount()) as string;
    const validTill = (await contract.read.validTill()) as string;
    const ipfsPeerId = (await contract.read.ipfsPeerId()) as string;
    return {
      providerAddress: walletAddress,
      pricePerSector,
      sectorCount,
      validTill,
      ipfsPeerId,
    };
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    throw err;
  }
}

export async function registerProvider(
  peerId: string,
  sectorCount: bigint,
  pricePerSector: bigint
) {
  try {
    const contract = getMarketplaceContract();
    const account = await getAccount();
    const hash = await contract.write.registerProvider(
      [peerId, sectorCount, pricePerSector],
      { account: account }
    );
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed:", receipt);
    return true;
  } catch (err: any) {
    if (err.message.includes("revert")) {
      const revertReason = err.message.match(/revert (.+)/);
      if (revertReason) {
        console.log("Revert Reason:", revertReason[1]);
      } else {
        console.log("Revert Reason not found");
      }
    } else {
      throw new Error("Can't register this provider", err);
    }
  }
}

export async function initiateDeal(
  providerAddress: AddressType,
  fileSize: bigint,
  duration: bigint
) {
  try {
    const marketplaceContract = getMarketplaceContract();
    const account = await getAccount();
    const hash = await marketplaceContract.write.initiateDeal(
      [providerAddress, fileSize, duration],
      { account }
    );
    console.log({ hash });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed:", receipt);
    return true;
  } catch (err: any) {
    if (err.message.includes("revert")) {
      const revertReason = err.message.match(/revert (.+)/);
      if (revertReason) {
        console.log("Revert Reason:", revertReason[1]);
      } else {
        console.log("Revert Reason not found", err.message);
      }
    } else {
      throw new Error("Can't create deal with this provider", err);
    }
  }
}

export async function fetchProviderDeals(providerAddress: AddressType) {
  const providerContract = getProviderContract(providerAddress);
  const deals = await providerContract.read.getDeals();

  return deals;
}

export async function fetchDealDetails(dealAddress: AddressType) {
  const dealContract = getDealContract(dealAddress);
  const pricePerSector = await dealContract.read.pricePerSector();
  const sectorCount = await dealContract.read.sectorCount();
  const validTill = await dealContract.read.validTill();
  const isActive = await dealContract.read.isActive();
  const isCompleted = await dealContract.read.completed();

  return {
    pricePerSector,
    sectorCount,
    validTill,
    isActive,
    isCompleted,
  };
}

export async function approveDeal(userAddress: AddressType) {
  const marketplaceContract = getMarketplaceContract();
  const account = await getAccount();
  const providerAddress = await marketplaceContract.read.provider_instances([account]) as AddressType;
  
  if (!providerAddress) throw new Error('User is not a provider');

  const providerContract = getProviderContract(providerAddress);
  await providerContract.write.approveDeal([userAddress]);
}
