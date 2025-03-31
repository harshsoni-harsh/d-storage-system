import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
  Logger,
} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createHelia, Helia } from "helia";
import { unixfs, UnixFS } from "@helia/unixfs";
import { FsBlockstore } from "blockstore-fs";
import { FsDatastore } from "datastore-fs";
import {
  CID,
  create as createIpfsClient,
  KuboRPCClient,
} from "kubo-rpc-client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KUBO_URL = process.env.KUBO_URL || "http://localhost:5001";

@Injectable()
export class StorageService implements OnModuleInit, OnApplicationShutdown {
  private helia?: Helia;
  private unixFs?: UnixFS;
  private ipfsClient!: KuboRPCClient;

  /** For file chunks compilation */
  private readonly storagePath = path.join(__dirname, "..", "..", "uploads");
  /** For persistent storage */
  private readonly ipfsDataPath = process.env.IPFS_PATH ?? "/data/ipfs";

  /** Auto generated */
  private emptyUnixDirHash = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";

  async onModuleInit(): Promise<void> {
    this.ensureStorageDirectory();
    await this.initIPFS();
  }

  private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
      Logger.debug(`Storage directory created at ${this.storagePath}`);
    }
    if (!fs.existsSync(this.ipfsDataPath)) {
      fs.mkdirSync(this.ipfsDataPath, { recursive: true });
      Logger.debug(`IPFS datastore created at ${this.ipfsDataPath}`);
    }
  }

  private async initIPFS(): Promise<void> {
    if (this.helia) return;

    Logger.debug("Initializing Helia with persistent storage...");

    const blockstore = new FsBlockstore(this.ipfsDataPath);
    const datastore = new FsDatastore(this.ipfsDataPath);

    this.helia = await createHelia({
      blockstore,
      datastore,
    });

    this.unixFs = unixfs(this.helia);
    this.ipfsClient = createIpfsClient({ url: KUBO_URL });

    Logger.debug("Helia and IPFS client initialized.");
  }

  async storeFile(fileBuffer: Buffer): Promise<string> {
    if (!this.unixFs) throw new Error("Helia is not initialized.");

    const uint8Array = new Uint8Array(fileBuffer);
    const cid = await this.unixFs.addBytes(uint8Array);
    const cidStr = cid.toString();

    Logger.debug(`File stored with CID: ${cidStr}`);

    // Pin the file via Kubo to persist storage
    await this.ipfsClient.pin.add(cidStr);
    Logger.debug(`File pinned with CID: ${cidStr}`);

    return cidStr;
  }

  async retrieveFile(cid: string): Promise<Buffer> {
    if (!this.unixFs) throw new Error("Helia is not initialized.");

    try {
      const cidObject = CID.parse(cid);
      const asyncIterable = this.unixFs.cat(cidObject);
      const fileChunks = await this.retrieveWithTimeout(asyncIterable, 10000);
      return Buffer.concat(fileChunks);
    } catch (error) {
      Logger.error(`Error retrieving file with CID ${cid}:`, error);
      throw new Error("Failed to retrieve file from IPFS.");
    }
  }

  async getPinnedFiles(): Promise<string[]> {
    try {
      const pinnedFiles: string[] = [];
      for await (const pin of this.ipfsClient.pin.ls({ type: "recursive" })) {
        if (pin.cid.toString() !== this.emptyUnixDirHash) {
          pinnedFiles.push(pin.cid.toString());
        }
      }
      return pinnedFiles;
    } catch (error) {
      Logger.error("Error fetching pinned files:", error);
      throw new Error("Failed to fetch pinned files from IPFS.");
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.helia) {
      Logger.debug("Shutting down Helia...");
      await this.helia.stop();
    }
  }

  private async retrieveWithTimeout(
    asyncIterable: AsyncIterable<Uint8Array>,
    timeoutMs: number
  ): Promise<Uint8Array[]> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("File retrieval timed out")),
        timeoutMs
      );
    });

    const fileChunks: Uint8Array[] = [];
    const retrieve = (async () => {
      for await (const chunk of asyncIterable) {
        fileChunks.push(chunk);
      }
      return fileChunks;
    })();

    return Promise.race([retrieve, timeoutPromise]).finally(() =>
      clearTimeout(timeoutId)
    );
  }
}
