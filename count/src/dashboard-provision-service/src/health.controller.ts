import { Controller, Get, Res, Req } from '@nestjs/common';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('ready')
  ready() {
    return { status: 'ready' };
  }

  @Get()
  root(@Res() res: any, @Req() req: any) {
    // 정적 파일 확장자를 가진 요청은 404 반환 (ServeStaticModule이 처리해야 함)
    const staticFileExtensions = ['.js', '.mjs', '.css', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.json', '.map', '.webp', '.avif'];
    const path = req.path || req.url;
    if (staticFileExtensions.some(ext => path.endsWith(ext))) {
      return res.status(404).send('Not found');
    }
    
    // React 빌드 산출물이 있으면 index.html을 서빙 (SPA 라우팅)
    // __dirname은 dist/ 디렉토리이므로, src/ui로 가려면 ../src/ui
    const distIndexPath = resolve(__dirname, '..', 'src', 'ui', 'dashboard', 'dist', 'index.html');
    const srcIndexPath = resolve(__dirname, '..', 'src', 'ui', 'dashboard', 'index.html');
    
    // 빌드된 파일 우선 확인
    if (existsSync(distIndexPath)) {
      return res.sendFile(distIndexPath);
    }
    // 소스 파일 확인 (개발 모드)
    if (existsSync(srcIndexPath)) {
      return res.sendFile(srcIndexPath);
    }
    // 빌드 산출물이 없으면 기본 응답
    return res.json({
      message: 'Dashboard Provision Service',
      status: 'running',
      ui: 'React UI is not built yet. Please run: cd src/ui/dashboard && npm install && npm run build',
    });
  }
}
