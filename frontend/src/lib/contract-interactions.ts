import { DealABI, MarketplaceABI, ProviderABI } from "@/lib/abi";
import { getContract, isAddress, parseEther } from "viem";
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
    abi: MarketplaceABI,
    address: MARKETPLACE_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
  return contract;
}

function getProviderContract(PROVIDER_CONTRACT: AddressType) {
  if (!PROVIDER_CONTRACT || !isAddress(PROVIDER_CONTRACT) || !walletClient)
    throw new Error("contract or walletClient not found");
  const contract = getContract({
    abi: ProviderABI,
    address: PROVIDER_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
  return contract;
}

function getDealContract(DEAL_CONTRACT: AddressType) {
  if (!DEAL_CONTRACT || !isAddress(DEAL_CONTRACT) || !walletClient)
    throw new Error("contract or walletClient not found");
  const contract = getContract({
    abi: DealABI,
    address: DEAL_CONTRACT,
    client: { public: publicClient, wallet: walletClient },
  });
  return contract;
}

export async function getProviders() {
  try {
    const contract = getMarketplaceContract();
    const providerList = await contract.read.getAllProviders();
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
    const [walletAddress, pricePerSector, sectorCount, validTill, ipfsPeerId] =
      (await contract.read.getProviderInfo());

    return {
      providerAddress: walletAddress,
      pricePerSector: Number(pricePerSector).toString(),
      sectorCount: Number(sectorCount).toString(),
      validTill: Number(validTill).toString(),
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
  fileSize: number,
  duration: number,
  amount: number
) {
  try {
    const marketplaceContract = getMarketplaceContract();
    const account = await getAccount();
    const hash = await marketplaceContract.write.initiateDeal(
      [providerAddress, BigInt(fileSize), BigInt(duration)],
      {
        account,
        value: parseEther(amount.toString()),
      }
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
  const deals = await providerContract.read.getAllDeals();

  return deals;
}

export async function fetchUserDeals() {
  const marketplaceContract = getMarketplaceContract();
  const deals = await marketplaceContract.read.getUserDeals();

  return deals;
}

export async function fetchDealDetails(dealAddress: AddressType) {
  const dealContract = getDealContract(dealAddress);
  
  const [pricePerSector, sectorCount, validTill, isActive, completed] = await dealContract.read.getDealInfo();

  return {
    pricePerSector,
    sectorCount,
    validTill,
    isActive,
    completed,
  };
}

export async function approveDeal(userAddress: AddressType) {
  const marketplaceContract = getMarketplaceContract();
  const account = await getAccount();
  const providerAddress = (await marketplaceContract.read.provider_instances([
    account,
  ])) as AddressType;

  if (!providerAddress) throw new Error("User is not a provider");

  const providerContract = getProviderContract(providerAddress);
  await providerContract.write.approveDeal([userAddress], {account});
}
