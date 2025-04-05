import { Injectable, Logger } from "@nestjs/common";
import { IPFSService } from "../ipfs/ipfs.service.js";

@Injectable()
export class PeersService {

  constructor(private readonly ipfsService: IPFSService) { }

  private get ipfsClient() {
    return this.ipfsService.ipfsClient;
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

  async getLatency(peerAddress: string) {
    try {
      const pingResults = this.ipfsClient.ping(peerAddress);
      for await (const res of pingResults) {
        if (res.time) {
          Logger.log(`Latency of ${peerAddress}: ${res.time} ms`)
          return `${res.time} ms`;
        } else if (!res.success) {
          Logger.debug(`Ping failed: ${res.text}`);
          throw new Error('Ping failed');
        } else {
          throw new Error('Ping failed');
        }
      }
    } catch (error) {
      Logger.error("Error measuring latency:", error);
      throw error;
    }
  }
}
