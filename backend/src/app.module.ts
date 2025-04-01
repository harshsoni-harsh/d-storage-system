import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module.js';
import { StorageService } from './storage/storage.service.js';
import { ConfigModule } from '@nestjs/config';
import { PeersModule } from './peers/peers.module.js';
import { IPFSModule } from './ipfs/ipfs.module.js';

@Module({
  imports: [
    StorageModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    PeersModule,
    IPFSModule
  ],
  providers: [StorageService]
})
export class AppModule {}
