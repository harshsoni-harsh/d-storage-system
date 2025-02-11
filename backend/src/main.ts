import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000

  // cors
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: '*',
    allowedHeaders: '*'
  })

  await app.listen(port, () => {
    console.log("Server started at ", port)
  });
}
bootstrap();
