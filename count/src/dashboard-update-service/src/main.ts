import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 활성화 (SSE를 위해 필요)
  app.enableCors({
    origin: true, // 개발 환경에서는 모든 origin 허용
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  });
  
  await app.listen(3005);
  console.log('Dashboard Update Service is running on port 3005');
}

bootstrap();
