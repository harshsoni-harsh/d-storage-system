import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module.js';
import { StorageService } from './storage/storage.service.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    StorageModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
  ],
  providers: [StorageService]
})
export class AppModule {}
