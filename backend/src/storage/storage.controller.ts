import {
  Controller,
  Post,
  Get,
  UploadedFile,
  Body,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { StorageService } from "./storage.service.js";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  private storagePath = path.join(__dirname, "..", "..", "uploads");

  /**
   * Upload a chunk of a file.
   */
  @Post("/upload-chunk")
  @UseInterceptors(FileInterceptor("file"))
  async uploadChunk(
    @UploadedFile() file,
    @Body("chunkIndex") chunkIndex: string,
    @Body("totalChunks") totalChunks: string,
    @Body("fileName") fileName: string
  ): Promise<{ message: string; cid: string; } | { message: string; cid?: undefined; }> {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }

    const filePath = path.join(this.storagePath, fileName);

    // Append the chunk to the final file
    fs.appendFileSync(filePath, file.buffer);

    console.log(`Received chunk ${chunkIndex}/${totalChunks} for ${fileName}`);

    // If last chunk, store file in IPFS
    if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
      console.log(`All chunks received. Storing ${fileName} in IPFS...`);
      const cid = await this.storageService.storeFile(file.buffer, filePath);
      return { message: "File upload complete", cid };
    }

    return { message: `Chunk ${chunkIndex} received` };
  }

  /**
   * Retrieve a file from IPFS by CID.
   */
  @Get("/getById")
  async retrieveFile(@Query("cid") cid: string) {
    console.log(`Retrieving file with CID: ${cid}`);
    const fileBuffer = await this.storageService.retrieveFile(cid);
    console.log(`Retrieved file with CID: ${cid}`);
    return { file: fileBuffer.toString() };
  }

  @Get('/')
  run() {
    return "hello"
  }

  async onApplicationShutdown(): Promise<void> {
    await this.storageService.onApplicationShutdown();
  }
}
