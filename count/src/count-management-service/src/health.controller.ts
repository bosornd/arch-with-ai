import { Controller, Get, Res, Req } from '@nestjs/common';
import { resolve } from 'path';
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

  @Get('*')
  root(@Res() res: any, @Req() req: any) {
    let path = req.path || req.url;
    // 쿼리 문자열 제거
    if (path.includes('?')) {
      path = path.split('?')[0];
    }
    const staticFileExtensions = [
      '.js',
      '.mjs',
      '.css',
      '.ico',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
      '.json',
      '.map',
      '.webp',
      '.avif',
    ];
    
    // 정적 파일 요청 처리
    if (staticFileExtensions.some(ext => path.endsWith(ext))) {
      // Ingress rewrite로 인해 /management/가 /로 변환되므로, 
      // /management/로 시작하는 경로를 처리하거나, 직접 파일명으로 시작하는 경로를 처리
      let relativePath = path.startsWith('/') ? path.substring(1) : path;
      
      // /management/ prefix 제거 (Ingress rewrite 후에도 남아있을 수 있음)
      if (relativePath.startsWith('management/')) {
        relativePath = relativePath.substring('management/'.length);
      }
      
      // 빌드된 파일 경로들 확인 (여러 가능한 경로 시도)
      const distPaths = [
        resolve(__dirname, '..', 'src', 'ui', 'management', 'dist', relativePath),
        resolve(__dirname, '..', 'src', 'ui', 'management', 'dist', 'management', relativePath),
        resolve(__dirname, '..', 'src', 'ui', 'management', 'dist', path.startsWith('/') ? path.substring(1) : path),
        resolve(__dirname, '..', 'src', 'ui', 'management', 'dist', 'assets', relativePath),
      ];
      
      // 디버깅 로그
      console.log(`[HealthController] Static file request: ${path}, trying paths:`, distPaths);
      
      // 빌드된 파일 우선 확인
      for (const distFilePath of distPaths) {
        if (existsSync(distFilePath)) {
          // MIME 타입 설정
          if (path.endsWith('.js') || path.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
          } else if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          console.log(`[HealthController] Serving file: ${distFilePath}`);
          return res.sendFile(distFilePath);
        }
      }
      
      // 파일을 찾지 못하면 favicon만 204, 나머지는 404 반환
      console.log(`[HealthController] File not found: ${path}`);
      if (path.endsWith('favicon.ico')) {
        return res.status(204).send();
      }
      return res.status(404).send('Not found');
    }
    
    // React 빌드 산출물이 있으면 index.html을 서빙 (SPA 라우팅)
    // __dirname은 dist/ 디렉토리이므로, src/ui로 가려면 ../src/ui
    const distIndexPath = resolve(
      __dirname,
      '..',
      'src',
      'ui',
      'management',
      'dist',
      'index.html'
    );
    
    // 빌드된 파일 우선 확인
    if (existsSync(distIndexPath)) {
      return res.sendFile(distIndexPath);
    }
    // 빌드 산출물이 없으면 기본 응답
    return res.json({
      message: 'Count Management Service',
      status: 'running',
      ui: 'React UI is not built yet. Please run: cd src/ui/management && npm install && npm run build',
    });
  }

  @Get('favicon.ico')
  favicon(@Res() res: any) {
    // favicon.ico 파일 경로들 확인
    const faviconPaths = [
      resolve(__dirname, '..', 'src', 'ui', 'management', 'dist', 'favicon.ico'),
      resolve(__dirname, '..', 'src', 'ui', 'management', 'favicon.ico'),
    ];
    
    for (const faviconPath of faviconPaths) {
      if (existsSync(faviconPath)) {
        return res.sendFile(faviconPath);
      }
    }
    
    // favicon이 없으면 204 No Content 반환 (브라우저가 계속 요청하는 것을 방지)
    return res.status(204).send();
  }
}
