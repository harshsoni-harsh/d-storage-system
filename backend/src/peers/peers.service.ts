import { Injectable, OnModuleInit } from "@nestjs/common";
import { create as createIpfsClient, KuboRPCClient } from "kubo-rpc-client";

const KUBO_URL = process.env.KUBO_URL || "http://localhost:5001";

@Injectable()
export class PeersService implements OnModuleInit {
  private ipfsClient!: KuboRPCClient;

  async onModuleInit(): Promise<void> {
    this.ipfsClient = createIpfsClient({ url: KUBO_URL });
    console.log("IPFS client initialized.");
  }

  async addPeer(peerId: any) {
    try {
      console.log(`Connecting to ${peerId}`);
      await this.ipfsClient.swarm.connect(peerId, { timeout: 10000 });
      console.log(`Successfully connected to ${peerId}`);
      return { message: "New peer has been added" };
    } catch (error) {
      console.error(`Failed to connect peer: ${peerId}`, error);
      throw new Error("IPFS peer connection failed");
    }
  }

  async findAll() {
    try {
      const peers = await this.ipfsClient.swarm.peers({
        latency: true,
      });
      return peers;
    } catch (error) {
      console.error("Failed to fetch peers", error);
      throw new Error("Failed to retrieve peers");
    }
  }
}
