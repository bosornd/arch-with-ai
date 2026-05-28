import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { HealthController } from './health.controller';

// React 빌드 산출물 경로 확인
// __dirname은 dist/ 디렉토리이므로, src/ui로 가려면 ../src/ui
const uiDistPath = resolve(__dirname, '..', 'src', 'ui', 'management', 'dist');

// 경로 확인 로그 (디버깅용)
if (existsSync(uiDistPath)) {
  console.log(`[AppModule] UI dist path exists: ${uiDistPath}`);
} else {
  console.log(`[AppModule] UI dist path not found: ${uiDistPath}`);
}

// 빌드 산출물이 있으면 정적 파일 서빙 설정
const staticModuleConfig = existsSync(uiDistPath)
  ? {
      rootPath: uiDistPath,
      serveRoot: '/management',
      exclude: ['/api*', '/health', '/ready'],
      serveStaticOptions: {
        index: 'index.html',
        fallthrough: true, // 정적 파일을 찾지 못하면 HealthController로 넘어감
        setHeaders: (res: any, path: string) => {
          // MIME 타입 명시적 설정
          if (path.endsWith('.js') || path.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
          } else if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          } else if (path.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
          }
        },
      },
    }
  : null;

@Module({
  imports: [
    // CountInfoModule,
    // CountValueModule,
    ...(staticModuleConfig ? [ServeStaticModule.forRoot(staticModuleConfig)] : []),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
