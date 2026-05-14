import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5200', 'http://localhost:5201', 'http://localhost:5202'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 TuxedoPOS API running on http://localhost:${port}/api/v1`);
}

bootstrap().catch(console.error);
