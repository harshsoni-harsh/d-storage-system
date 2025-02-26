import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createHelia, Helia } from "helia";
import { unixfs, UnixFS } from "@helia/unixfs";
import { create as createIpfsClient, IPFSHTTPClient } from "ipfs-http-client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Injectable()
export class StorageService implements OnModuleInit, OnApplicationShutdown {
  private helia?: Helia;
  private unixFs?: any;
  private ipfsClient!: IPFSHTTPClient;
  private readonly storagePath = path.join(__dirname, "..", "..", "uploads");

  async onModuleInit(): Promise<void> {
    await this.initIPFS();
    this.ensureStorageDirectory();
  }

  private async initIPFS(): Promise<void> {
    if (this.helia) return; // Prevents redundant initialization

    this.helia = await createHelia();
    this.unixFs = unixfs(this.helia);
    this.ipfsClient = createIpfsClient({ url: "http://localhost:5001" });

    console.log("Helia and IPFS client initialized.");
  }

  private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
      console.log(`Storage directory created at ${this.storagePath}`);
    }
  }

  async storeFile(fileBuffer: Buffer): Promise<string> {
    if (!this.unixFs) throw new Error("Helia is not initialized.");

    const uint8Array = new Uint8Array(fileBuffer);
    const cid = await this.unixFs.addFile({ content: uint8Array });
    const cidStr = cid.toString();

    console.log(`File stored with CID: ${cidStr}`);

    // Pin the file via Kubo to persist storage
    await this.ipfsClient.pin.add(cidStr);
    console.log(`File pinned with CID: ${cidStr}`);

    return cidStr;
  }

  async retrieveFile(cid: string): Promise<Buffer> {
    if (!this.unixFs) throw new Error("Helia is not initialized.");

    try {
      const asyncIterable = this.unixFs.cat(cid);
      const fileChunks = await this.retrieveWithTimeout(asyncIterable, 10000);
      return Buffer.concat(fileChunks);
    } catch (error) {
      console.error(`Error retrieving file with CID ${cid}:`, error);
      throw new Error("Failed to retrieve file from IPFS.");
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.helia) {
      console.log("Shutting down Helia...");
      await this.helia.stop();
    }
  }

  private async retrieveWithTimeout(
    asyncIterable: AsyncIterable<Uint8Array>,
    timeoutMs: number
  ): Promise<Uint8Array[]> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("File retrieval timed out")), timeoutMs)
    );

    const fileChunks: Uint8Array[] = [];
    const retrieve = (async () => {
      for await (const chunk of asyncIterable) {
        fileChunks.push(chunk);
      }
      return fileChunks;
    })();

    return Promise.race([retrieve, timeout]);
  }
}
