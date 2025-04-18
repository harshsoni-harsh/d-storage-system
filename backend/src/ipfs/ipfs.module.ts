import { Module } from "@nestjs/common";
import { IPFSController } from "./ipfs.controller.js";
import { IPFSService } from "./ipfs.service.js";

@Module({
  controllers: [IPFSController],
  providers: [IPFSService],
  exports: [IPFSService],
})
export class IPFSModule {}
