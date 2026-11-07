/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// 빌드 대상은 mode로 고른다: `--mode admin-web`이면 관리자 웹, 그 외는 앱.
// 값은 VITE_BUILD_TARGET으로 넘기고, 코드에서는 shared/config/env.ts에서만 읽는다.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const buildTarget = mode === 'admin-web' ? 'admin-web' : 'app';
  const proxyTarget = env.VITE_API_PROXY_TARGET;

  return {
    plugins: [react(), tailwindcss(), tsconfigPaths()],
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
