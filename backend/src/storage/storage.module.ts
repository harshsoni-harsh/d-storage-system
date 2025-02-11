import { Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { StorageController } from './storage.controller.js';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
