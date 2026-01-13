import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Load environment files with precedence: .env.<NODE_ENV>.local -> .env -> process.env
  const env = process.env.NODE_ENV || 'development';
  dotenv.config({ path: `.env.${env}.local` });
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Enable CORS for the frontend origin (default to localhost:5173)
  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  app.enableCors({ origin: frontendOrigin, credentials: true });

  await app.listen(process.env.PORT || 3000);
  console.log(`Server running on port ${process.env.PORT || 3000} (CORS allowed: ${frontendOrigin})`);
}
bootstrap();
