import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { HeliaLibp2p, createHelia } from "helia";
import { unixfs } from "@helia/unixfs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Injectable()
export class StorageService implements OnModuleInit, OnApplicationShutdown {
  private helia?: HeliaLibp2p;
  private fs: any;
  private storagePath = path.join(__dirname, "..", "..", "uploads");

  // temporary upload storage
  async onModuleInit() {
    await this.initIPFS();
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  private async initIPFS() {
    if (!this.helia) {
      this.helia = await createHelia();
      this.fs = unixfs(this.helia);
    }
  }

  async storeFile(fileBuffer: Buffer): Promise<string> {
    try {
      if (!this.fs) await this.initIPFS();

      const uint8Array = new Uint8Array(fileBuffer);
      const cid = await this.fs.addFile({
        content: uint8Array,
      });

      console.log(`File stored in Helia with CID: ${cid.toString()}`);

      return cid.toString();
    } catch (error) {
      console.error("Error storing file:", error);
      throw new Error("Failed to store file");
    }
  }

  async retrieveFile(cid: string): Promise<Buffer> {
    try {
      if (!this.fs) throw new Error("Helia is not initialized.");

      const asyncIterable = this.fs.cat(cid);

      const fileChunks: Uint8Array[] = await this.retrieveWithTimeout(
        asyncIterable,
        10000
      );

      return Buffer.concat(fileChunks);
    } catch (error) {
      console.error("Error retrieving file:", error);
      throw new Error("Failed to retrieve file");
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
    ms: number
  ): Promise<Uint8Array[]> {
    const timer = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), ms)
    );

    const chunks: Uint8Array[] = [];
    const retrieveFile = (async () => {
      for await (const chunk of asyncIterable) {
        chunks.push(chunk);
      }
      return chunks;
    })();

    return Promise.race([retrieveFile, timer]);
  }
}
