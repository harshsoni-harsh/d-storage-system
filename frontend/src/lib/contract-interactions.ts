import getWeb3 from "@/lib/web3";
import { marketplaceABI } from "@/lib/abi";

const MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;

function getContract(
  contractABI: any,
  contractAddress: string | undefined
) {
  const web3 = getWeb3();

  if (!contractAddress) throw new Error("contract address is missing");
  if (!contractABI || !Array.isArray(contractABI)) {
    console.error("Invalid ABI:", contractABI);
    throw new Error("Invalid ABI provided");
  }

  web3.eth.handleRevert = true;

  return new web3.eth.Contract(contractABI, contractAddress);
}

export async function getProviders() {
  try {
    const contract = getContract(marketplaceABI, MARKETPLACE_CONTRACT);
    const providerList = await contract.methods.getProviderList().call();
    return providerList;
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    throw err;
  }
}

export async function registerProvider(
  peerId: string,
  sectorCount: number,
  pricePerSector: number
) {
  try {
    const web3 = getWeb3();

    const contract = getContract(marketplaceABI, MARKETPLACE_CONTRACT);
    const accounts = await web3.eth.getAccounts();
    if (!accounts?.length) throw new Error("No web3 accounts found.")
    const sender = Array.isArray(accounts) ? accounts[0] : accounts;
    await contract.methods
      .registerProvider(peerId, sectorCount, pricePerSector)
      .send({ from: sender });
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
        console.error(err instanceof Error ? err.message : err);
    }
    throw err;
  }
}
