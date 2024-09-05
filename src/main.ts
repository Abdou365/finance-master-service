import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true },
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
