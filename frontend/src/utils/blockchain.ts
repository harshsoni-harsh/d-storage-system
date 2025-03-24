import Web3 from "web3";
import { marketplaceABI } from "@/utils/abi";

const MARKETPLACE_CONTRACT = process.env.MARKETPLACE_CONTRACT;

export class StorageMarketplace {
  private web3: Web3;
  private contract: any;

  constructor() {
    if (!window.ethereum) throw new Error("MetaMask is required");
    this.web3 = new Web3(window.ethereum);
    this.contract = new this.web3.eth.Contract(marketplaceABI as any, MARKETPLACE_CONTRACT);
  }

  // Register Provider
  async registerProvider(ipfsPeerId: string, availableStorage: number, pricePerKB: number, from: string): Promise<void> {
    const tx = await this.contract.methods.registerProvider(ipfsPeerId, availableStorage, pricePerKB).send({ from });
    console.log("Provider registered successfully", tx);
  }

  // Create Storage Agreement
  async createAgreement(provider: string, cid: string, fileSize: number, duration: number, payment: string, from: string): Promise<void> {
    const tx = await this.contract.methods.createAgreement(provider, cid, fileSize, duration).send({ from, value: this.web3.utils.toWei(payment, "ether") });
    console.log("Storage agreement created successfully", tx);
  }

  // Release Payment
  async releasePayment(agreementId: number, from: string): Promise<void> {
    const tx = await this.contract.methods.releasePayment(agreementId).send({ from });
    console.log("Payment released successfully", tx);
  }

  // Get Provider Info
  async getProviderInfo(address: string): Promise<any> {
    const provider = await this.contract.methods.providers(address).call();
    return {
      ipfsPeerId: provider.ipfsPeerId,
      availableStorage: Number(provider.availableStorage),
      pricePerKB: Number(provider.pricePerKB),
      exists: provider.exists
    };
  }

  // Get Agreement Info
  async getAgreementInfo(agreementId: number): Promise<any> {
    const agreement = await this.contract.methods.agreements(agreementId).call();
    return {
      user: agreement.user,
      provider: agreement.provider,
      cid: agreement.cid,
      fileSize: Number(agreement.fileSize),
      duration: Number(agreement.duration),
      amountPaid: this.web3.utils.fromWei(agreement.amountPaid, "ether"),
      endTime: new Date(Number(agreement.endTime) * 1000),
      completed: agreement.completed
    };
  }
}
