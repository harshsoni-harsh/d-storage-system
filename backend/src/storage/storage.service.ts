import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import { CID } from "kubo-rpc-client";
import { IPFSService } from "../ipfs/ipfs.service.js";

@Injectable()
export class StorageService {
  constructor(private readonly ipfsService: IPFSService) {}

  private get ipfsClient() {
    return this.ipfsService.ipfsClient;
  }

  /** Auto generated */
  private emptyUnixDirHash = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";

  async storeFile(fileStream: NodeJS.ReadableStream): Promise<string> {
    const source = {
      async *[Symbol.asyncIterator]() {
        for await (const chunk of fileStream) {
          yield chunk as Uint8Array;
        }
      },
    };
    const result = await this.ipfsClient.add(source, { pin: true });
    return result.cid.toString();
  }

  async retrieveFile(cid: string, addr?: string): Promise<Readable> {
    try {
      const cidObject = CID.parse(cid);

      if (addr) {
        try {
          Logger.debug(`Attempting to connect to peer: ${addr}`);
          await this.ipfsClient.swarm.connect(addr as any);
          Logger.debug(`Successfully connected to peer: ${addr}`);
        } catch (connectError) {
          Logger.warn(`Could not connect to peer ${addr}:`, connectError);
        }
      }

      try {
        await this.ipfsClient.pin.add(cidObject, { verbose: true });
        Logger.debug(`File with CID ${cid} successfully pinned.`);
      } catch (pinError) {
        Logger.warn(`Failed to pin CID ${cid}:`, pinError);
      }

      const stream = Readable.from(
        this.ipfsClient.cat(cidObject, { timeout: 30000 })
      );

      let totalBytes = 0;

      stream.on("error", (err) => {
        Logger.error(`Stream error for CID ${cid}:`, err);
      });

      stream.on("data", (chunk) => {
        totalBytes += chunk.length;
        Logger.debug(`Received ${totalBytes} bytes`);
      });

      stream.on("end", () => {
        Logger.debug("Stream finished!");
      });

      return stream;
    } catch (error) {
      Logger.error(`Failed to retrieve file with CID ${cid}:`, error);
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

  async pinFile(cid: string) {
    try {
      Logger.debug(`Pinning file: ${cid}`);
      const res = await this.ipfsClient.pin.add(cid);
      Logger.debug(`Pinned file: ${cid}`);
    } catch (err) {
      Logger.error(
        `Error pinning file: ${err instanceof Error ? err.message : err}`
      );
      throw err;
    }
  }
  async removePin(cid: string) {
    try {
      await this.ipfsClient.pin.rm(cid);
      Logger.debug(`Removed pin: ${cid}`);
    } catch (err) {
      Logger.error(
        `Error removing pin: ${err instanceof Error ? err.message : err}`
      );
      throw err;
    }
  }
}
