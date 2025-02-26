import {
  Controller,
  Post,
  Get,
  UploadedFile,
  Body,
  UseInterceptors,
  Query,
  HttpException,
  HttpStatus,
  StreamableFile,
} from "@nestjs/common";
import { StorageService } from "./storage.service.js";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { promises as fsPromises } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Controller("storage")
export class StorageController {
  private readonly storagePath = path.join(__dirname, "..", "..", "uploads");

  constructor(private readonly storageService: StorageService) {}

  @Post("/upload-chunk")
  @UseInterceptors(FileInterceptor("file"))
  async uploadChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body("chunkIndex") chunkIndex: string,
    @Body("totalChunks") totalChunks: string,
    @Body("fileName") fileName: string
  ): Promise<{ message: string; cid?: string }> {
    if (!file) {
      throw new HttpException("No file uploaded", HttpStatus.BAD_REQUEST);
    }
    if (!chunkIndex || !totalChunks || !fileName) {
      throw new HttpException("Missing required fields", HttpStatus.BAD_REQUEST);
    }

    const chunkIdx = parseInt(chunkIndex, 10);
    const totalChunksNum = parseInt(totalChunks, 10);
    
    if (isNaN(chunkIdx) || isNaN(totalChunksNum) || chunkIdx < 0 || totalChunksNum <= 0) {
      throw new HttpException("Invalid chunk index or total chunks", HttpStatus.BAD_REQUEST);
    }

    await this.ensureStorageDirectory();
    const filePath = path.join(this.storagePath, fileName);

    await fsPromises.appendFile(filePath, file.buffer);
    console.debug(`Received chunk ${chunkIndex}/${totalChunks} for ${fileName}`);

    if (chunkIdx + 1 === totalChunksNum) {
      console.log(`All chunks received. Storing ${fileName} in IPFS...`);
      try {
        const fileBuffer = await fsPromises.readFile(filePath);
        const cid = await this.storageService.storeFile(fileBuffer);

        // Remove temporary file after successful storage
        await fsPromises.unlink(filePath);
        console.log(`File ${fileName} successfully stored with CID: ${cid}`);

        return { message: "File upload complete", cid };
      } catch (error) {
        console.error("Error storing file:", error);
        throw new HttpException("Failed to store file", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    return { message: `Chunk ${chunkIndex} received` };
  }

  @Get("/getById")
  async retrieveFile(@Query("cid") cid: string): Promise<StreamableFile> {
    if (!cid) {
      throw new HttpException("CID is required", HttpStatus.BAD_REQUEST);
    }
    try {
      console.log(`Retrieving file with CID: ${cid}`);
      const fileBuffer = await this.storageService.retrieveFile(cid);

      console.log(`Successfully retrieved file with CID: ${cid}`);
      return new StreamableFile(fileBuffer, {
        disposition: 'attachment; filename="retrieved-file"',
        type: "application/octet-stream",
      });
    } catch (error) {
      console.error("Error retrieving file:", error);
      throw new HttpException("File retrieval failed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fsPromises.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      console.error("Error ensuring storage directory:", error);
      throw new HttpException("Failed to create storage directory", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.storageService.onApplicationShutdown();
  }
}
