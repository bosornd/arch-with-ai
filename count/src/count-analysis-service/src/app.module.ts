import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { HealthController } from './health.controller';

// React 빌드 산출물 경로 확인
// __dirname은 dist/ 디렉토리이므로, src/ui로 가려면 ../src/ui
const uiDistPath = resolve(__dirname, '..', 'src', 'ui', 'analysis', 'dist');
const uiPath = resolve(__dirname, '..', 'src', 'ui', 'analysis');

// 빌드 산출물이 있으면 정적 파일 서빙 설정
const staticModuleConfig = existsSync(uiDistPath)
  ? {
      rootPath: uiDistPath,
      serveRoot: '/analysis',
      exclude: ['/api*', '/health', '/ready'],
      serveStaticOptions: {
        index: 'index.html',
        fallthrough: true, // 정적 파일을 찾지 못하면 다음 핸들러로 넘어감
      },
    }
  : existsSync(uiPath)
  ? {
      rootPath: uiPath,
      serveRoot: '/analysis',
      exclude: ['/api*', '/health', '/ready'],
      serveStaticOptions: {
        index: 'index.html',
        fallthrough: true, // 정적 파일을 찾지 못하면 다음 핸들러로 넘어감
      },
    }
  : null;

@Module({
  imports: [
    // CountValueModule,
    ...(staticModuleConfig ? [ServeStaticModule.forRoot(staticModuleConfig)] : []),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
