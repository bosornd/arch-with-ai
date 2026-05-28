import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ServeStaticModule의 serveRoot가 /management로 설정되어 있어 global prefix 불필요
  await app.listen(3002);
  console.log('Count Management Service is running on port 3002');
}

bootstrap();
