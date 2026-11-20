import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { authClientBindings } from '@features/auth';
import { registerAuthHandlers } from '@shared/api';
import { assertEnv, env, EnvError } from '@shared/config/env';
import { runtime } from '@shared/platform';
import '@shared/styles/index.css';

import { AppProviders } from './providers/AppProviders';
import { createQueryClient } from './providers/queryClient';
import { createRoutes } from './router/routes';

// 필수 환경 변수가 빠진 빌드는 바로 멈춘다. 기기에서 흰 화면만 보이지 않도록 빠진 키 이름을 글자로 띄운다.
// 개발자의 설정 누락일 때만 나오는 화면이라 디자인은 입히지 않는다. textContent라 HTML로 해석되지 않는다.
try {
  assertEnv({ isNative: runtime.isNative() });
} catch (error) {
  const root = document.getElementById('root');
  if (root && error instanceof EnvError) root.textContent = error.message;
  throw error;
}

// 통신 계층이 auth의 메모리 토큰에 닿는 유일한 연결
registerAuthHandlers(authClientBindings);

// MSW는 VITE_ENABLE_MSW=true인 개발 빌드에서만, 앱을 그리기 전에 시작한다.
// 동적 import라 운영 빌드에는 들어가지 않는다.
async function startMocks(): Promise<void> {
  if (!env.enableMocks) return;
  const { startMockWorker } = await import('@test/msw/browser');
  await startMockWorker();
}

function render(): void {
  const root = document.getElementById('root');
  if (!root) return;

  const router = createBrowserRouter(createRoutes(env.buildTarget));
  const queryClient = createQueryClient();
  createRoot(root).render(
    <StrictMode>
      <AppProviders queryClient={queryClient}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
}

void startMocks().then(render);
