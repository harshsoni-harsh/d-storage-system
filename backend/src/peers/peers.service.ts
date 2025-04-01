import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { create as createIpfsClient, KuboRPCClient } from "kubo-rpc-client";

const KUBO_URL = process.env.KUBO_URL || "http://localhost:5001";

@Injectable()
export class PeersService implements OnModuleInit {
  private ipfsClient!: KuboRPCClient;

  async onModuleInit(): Promise<void> {
    this.ipfsClient = createIpfsClient({ url: KUBO_URL });
    Logger.debug("IPFS client initialized.", "peers");
  }

  async addPeer(peerId: any) {
    try {
      Logger.debug(`Connecting to ${peerId}`, "peers");
      await this.ipfsClient.swarm.connect(peerId, { timeout: 10000 });
      Logger.debug(`Successfully connected to ${peerId}`, "peers");
      return { message: "New peer has been added" };
    } catch (error) {
      Logger.error(`Failed to connect peer: ${peerId} ${error}`, "peers");
      throw new Error("IPFS peer connection failed");
    }
  }

  async findPeers(peerAddress: any) {
    if (!peerAddress) {
      try {
        const peers = await this.ipfsClient.swarm.peers({
          latency: true,
        });
        Logger.debug(`${peers?.length ?? 0} peers found`, "peers");
        return peers;
      } catch (error) {
        Logger.error("Failed to fetch peers", error, "peers");
        throw new Error("Failed to retrieve peers");
      }
    } else {
      const peerInfo = this.ipfsClient.id({ peerId: peerAddress });
      return peerInfo;
    }
  }
}
