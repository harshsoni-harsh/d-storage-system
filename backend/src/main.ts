import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3002

  // cors
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: '*',
    allowedHeaders: '*'
  })

  await app.listen(port, () => {
    Logger.debug("Server started at " + port, "Main")
  });
}
bootstrap();
