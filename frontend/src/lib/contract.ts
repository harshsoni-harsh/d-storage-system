import getWeb3 from "./web3";
import { marketplaceABI } from "@/lib/abi";

const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS;

const web3 = getWeb3();

export const storageMarketplace = new web3.eth.Contract(marketplaceABI, MARKETPLACE_ADDRESS);
