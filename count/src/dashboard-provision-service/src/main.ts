import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ServeStaticModule의 serveRoot가 /dashboard로 설정되어 있어 global prefix 불필요
  await app.listen(3004);
  console.log('Dashboard Provision Service is running on port 3004');
}

bootstrap();
