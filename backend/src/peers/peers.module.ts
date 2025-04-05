import { Module } from '@nestjs/common';
import { PeersService } from './peers.service.js';
import { PeersController } from './peers.controller.js';
import { IPFSModule } from '../ipfs/ipfs.module.js';

@Module({
  controllers: [PeersController],
  providers: [PeersService],
  imports: [IPFSModule],
})
export class PeersModule {}
