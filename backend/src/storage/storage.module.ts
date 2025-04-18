import { Module } from "@nestjs/common";
import { IPFSModule } from "../ipfs/ipfs.module.js";
import { StorageController } from "./storage.controller.js";
import { StorageService } from "./storage.service.js";

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  imports: [IPFSModule],
})
export class StorageModule {}
