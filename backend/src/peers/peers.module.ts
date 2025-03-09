import { Module } from '@nestjs/common';
import { PeersService } from './peers.service.js';
import { PeersController } from './peers.controller.js';

@Module({
  controllers: [PeersController],
  providers: [PeersService],
})
export class PeersModule {}
