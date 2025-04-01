import getWeb3 from "@/lib/web3";
import { marketplaceABI, providerABI } from "@/lib/abi";
import { getContract, isAddress, zeroAddress } from "viem";
import { getAccount, publicClient, walletClient } from "./web3-clients";
import { ProviderType } from "@/types/types";

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

function getProviderContract(PROVIDER_CONTRACT: `0x${string}`) {
  if (!PROVIDER_CONTRACT || !isAddress(PROVIDER_CONTRACT) || !walletClient)
    throw new Error("contract or walletClient not found");
  const contract = getContract({
    abi: providerABI,
    address: PROVIDER_CONTRACT,
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

export async function getProviderDetails(providerAddress: `0x${string}`): Promise<ProviderType> {
  try {
    const contract = getProviderContract(providerAddress);
    const pricePerSector = await contract.read.pricePerSector() as string;
    const sectorCount = await contract.read.sectorCount() as string;
    const validTill = await contract.read.validTill() as string;
    const ipfsPeerId = await contract.read.ipfsPeerId() as string;
    return {
      providerAddress,
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

export async function createDeal(
  providerAddress: `0x${string}`,
  fileSize: bigint,
  duration: bigint
) {
  try {
    const providerContract = getProviderContract(providerAddress);
    const account = await getAccount();
    console.log({ account });
    const hash = await providerContract.write.createDeal(
      [account, providerAddress, fileSize, duration],
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
        console.log("Revert Reason not found");
      }
    } else {
      throw new Error("Can't create deal with this provider", err);
    }
  }
}

export async function fetchProviderDeals(providerAddress: `0x${string}`) {
  try {
    const providerContract = getProviderContract(providerAddress);
    const deals = await providerContract.read.getDeals();

    return deals;
  } catch (err: any) {
    if (err.message.includes("revert")) {
      const revertReason = err.message.match(/revert (.+)/);
      if (revertReason) {
        console.log("Revert Reason:", revertReason[1]);
      } else {
        console.log("Revert Reason not found");
      }
    } else {
      console.error(err);
      throw new Error("Can't fetch deals for provider " + providerAddress);
    }
  }
}
