import { defineConfig, devices } from '@playwright/test';

// 흐름 테스트는 웹 빌드 대상(개발 서버 + MSW)에서 돌린다. CI에는 나중에 추가한다.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // 개발 서버는 화면 파일을 처음 요청받을 때 변환한다. 여러 테스트가 동시에 첫 화면을 열면 기본값 5초를 넘길 수 있다.
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: { VITE_ENABLE_MSW: 'true' },
  },
});
