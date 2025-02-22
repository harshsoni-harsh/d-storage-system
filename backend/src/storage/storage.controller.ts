import {
  Controller,
  Post,
  Get,
  UploadedFile,
  Body,
  UseInterceptors,
  Query,
  Res,
} from "@nestjs/common";
import { StorageService } from "./storage.service.js";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { Multer } from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Controller("storage")
export class StorageController {
  private storagePath = path.join(__dirname, "..", "..", "uploads");

  constructor(private readonly storageService: StorageService) {}

  @Post("/upload-chunk")
  @UseInterceptors(FileInterceptor("file"))
  async uploadChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body("chunkIndex") chunkIndex: string,
    @Body("totalChunks") totalChunks: string,
    @Body("fileName") fileName: string
  ): Promise<{ message: string; cid?: string }> {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }

    const filePath = path.join(this.storagePath, fileName);
    fs.appendFileSync(filePath, file.buffer);

    console.log(`Received chunk ${chunkIndex}/${totalChunks} for ${fileName}`);

    if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
      console.log(`All chunks received. Storing ${fileName} in IPFS...`);
      const fileBuffer = await readFile(filePath);
      const cid = await this.storageService.storeFile(fileBuffer);

      // Cleanup temp file after upload
      fs.unlinkSync(filePath);

      return { message: "File upload complete", cid };
    }

    return { message: `Chunk ${chunkIndex} received` };
  }

  @Get("/getById")
  async retrieveFile(@Query("cid") cid: string, @Res() res) {
    try {
      console.log(`Retrieving file with CID: ${cid}`);
      const fileBuffer = await this.storageService.retrieveFile(cid);
      console.log(`Successfully retrieved file with CID: ${cid}`);

      res.set({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="retrieved-file"`,
      });

      res.send(fileBuffer);
    } catch (error) {
      res.status(500).send({ error: "File retrieval failed" });
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.storageService.onApplicationShutdown();
  }
}
