/// <reference types="vitest/config" />
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// MSW 워커(public/mockServiceWorker.js)는 개발 서버에서만 쓴다.
// Vite는 public/을 빌드 폴더에 그대로 복사하므로, 빌드가 끝나면 이 파일만 지운다.
function dropMswWorker(): Plugin {
  let outDir = '';
  return {
    name: 'drop-msw-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      rmSync(resolve(outDir, 'mockServiceWorker.js'), { force: true });
    },
  };
}

// 빌드 대상은 mode로 고른다: `--mode admin-web`이면 관리자 웹, 그 외는 앱.
// 값은 VITE_BUILD_TARGET으로 넘기고, 코드에서는 shared/config/env.ts에서만 읽는다.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const buildTarget = mode === 'admin-web' ? 'admin-web' : 'app';
  const proxyTarget = env.VITE_API_PROXY_TARGET;

  return {
    plugins: [react(), tailwindcss(), tsconfigPaths(), dropMswWorker()],
    define: {
      'import.meta.env.VITE_BUILD_TARGET': JSON.stringify(buildTarget),
    },
    server: {
      port: 5173,
      // 1학기 Vercel 리라이트와 같은 방식: /api를 같은 출처로 받아 백엔드로 넘긴다.
      proxy: proxyTarget ? { '/api': { target: proxyTarget, changeOrigin: true } } : undefined,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
    },
  };
});
