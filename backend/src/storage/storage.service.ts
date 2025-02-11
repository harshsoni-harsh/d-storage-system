import { Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import { HeliaLibp2p, createHelia } from "helia";
import * as path from "path";
import { unixfs } from "@helia/unixfs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Injectable()
export class StorageService implements OnModuleInit {
  private helia: HeliaLibp2p;
  private fs: any;
  private storagePath = path.join(__dirname, "..", "..", "uploads");

  async onModuleInit() {
    await this.initIPFS();
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  private async initIPFS() {
    if (!this.helia || !this.fs) {
      this.helia = await createHelia();
      this.fs = unixfs(this.helia);
    }
  }

  async storeFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
      if (!this.fs) await this.initIPFS();

      // Convert Buffer to Uint8Array (Helia requires this format)
      const uint8Array = new Uint8Array(fileBuffer);

      // Store in IPFS
      const cid = await this.fs.addFile({
        content: uint8Array,
      });

      return cid.toString();
    } catch (error) {
      console.error("Error storing file:", error);
      throw new Error("Failed to store file");
    }
  }

  async retrieveFile(cid: string): Promise<Buffer> {
    try {
      if (!this.fs) await this.initIPFS();

      const fileChunks: Uint8Array[] = [];
      for await (const chunk of this.fs.cat(cid)) {
        fileChunks.push(chunk);
      }

      return Buffer.concat(fileChunks);
    } catch (error) {
      console.error("Error retrieving file:", error);
      throw new Error("Failed to retrieve file");
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.helia != null) {
      await this.helia.stop();
    }
  }
}
