import { Module } from "@nestjs/common";
import { IPFSModule } from "../ipfs/ipfs.module.js";
import { PeersController } from "./peers.controller.js";
import { PeersService } from "./peers.service.js";

@Module({
  controllers: [PeersController],
  providers: [PeersService],
  imports: [IPFSModule],
})
export class PeersModule {}
