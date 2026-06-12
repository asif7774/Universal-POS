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
  const origins = process.env.ALLOWED_ORIGINS?.split(',') ?? [
    'http://localhost:5200',
    'http://localhost:5201',
    'http://localhost:5202',
    'http://localhost:5203',
    'https://pos.walit.in',
    'https://universal-pos-asif7774s-projects.vercel.app'
  ];
  app.enableCors({
    origin: origins,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 TuxedoPOS API running on http://localhost:${port}/api/v1`);
}

bootstrap().catch(console.error);
