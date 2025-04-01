import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PeersService } from './peers.service.js';

@Controller('peers')
export class PeersController {
  constructor(private readonly peersService: PeersService) {}

  @Post()
  addPeer(@Body("peerId") peerId: string) {
    console.log(peerId);
    return this.peersService.addPeer(peerId);
  }

  @Get()
  async findPeers(@Query("peerId") peerAddress: string) {
    return await this.peersService.findPeers(peerAddress);
  }
}
