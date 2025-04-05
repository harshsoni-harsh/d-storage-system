import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { create as createIpfsClient, KuboRPCClient } from "kubo-rpc-client";

const KUBO_URL = process.env.KUBO_URL || "http://localhost:5001";

@Injectable()
export class IPFSService {
  ipfsClient!: KuboRPCClient;

  async onModuleInit(): Promise<void> {
    this.ipfsClient = createIpfsClient({ url: KUBO_URL });
    Logger.debug("IPFS client initialized.", "ipfs");
  }

  async getAddr() {
    return await this.ipfsClient.id();
  }
}
