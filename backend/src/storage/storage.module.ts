import { Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { StorageController } from './storage.controller.js';
import { IPFSModule } from '../ipfs/ipfs.module.js';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  imports: [IPFSModule],
})
export class StorageModule {}
