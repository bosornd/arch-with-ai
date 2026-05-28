import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { HealthController } from './health.controller';

// React 빌드 산출물 경로 확인
// __dirname은 dist/ 디렉토리이므로, src/ui로 가려면 ../src/ui
const uiDistPath = resolve(__dirname, '..', 'src', 'ui', 'dashboard', 'dist');
const uiPath = resolve(__dirname, '..', 'src', 'ui', 'dashboard');

// 빌드 산출물이 있으면 정적 파일 서빙 설정
const staticModuleConfig = existsSync(uiDistPath)
  ? {
      rootPath: uiDistPath,
      serveRoot: '/dashboard',
      exclude: ['/api*', '/health', '/ready', '/dashboard/events*'],
      serveStaticOptions: {
        index: 'index.html',
        fallthrough: true, // 정적 파일을 찾지 못하면 다음 핸들러로 넘어김
      },
    }
  : existsSync(uiPath)
  ? {
      rootPath: uiPath,
      serveRoot: '/dashboard',
      exclude: ['/api*', '/health', '/ready', '/dashboard/events*'],
      serveStaticOptions: {
        index: 'index.html',
        fallthrough: true, // 정적 파일을 찾지 못하면 다음 핸들러로 넘어감
      },
    }
  : null;

@Module({
  imports: [
    // CountInfoModule,
    // CountValueModule,
    // TypeOrmModule.forFeature([DashboardConfigEntity]),
    ...(staticModuleConfig ? [ServeStaticModule.forRoot(staticModuleConfig)] : []),
  ],
  controllers: [HealthController],
  providers: [
    // DashboardManager,
    // DashboardConfigRepository,
  ],
})
export class AppModule {}
