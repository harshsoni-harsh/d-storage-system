import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IPFSModule } from "./ipfs/ipfs.module.js";
import { PeersModule } from "./peers/peers.module.js";
import { StorageModule } from "./storage/storage.module.js";
import { StorageService } from "./storage/storage.service.js";

@Module({
  imports: [
    StorageModule,
    ConfigModule.forRoot({
      envFilePath: [".env.local", ".env"],
      isGlobal: true,
    }),
    PeersModule,
    IPFSModule,
  ],
  providers: [StorageService],
})
export class AppModule {}
