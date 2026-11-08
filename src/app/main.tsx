import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { authClientBindings } from '@features/auth';
import { registerAuthHandlers } from '@shared/api';
import { env } from '@shared/config/env';
import '@shared/styles/index.css';

import { AppProviders } from './providers/AppProviders';
import { createQueryClient } from './providers/queryClient';
import { createRoutes } from './router/routes';

// 통신 계층이 auth의 메모리 토큰에 닿는 유일한 연결
registerAuthHandlers(authClientBindings);

const router = createBrowserRouter(createRoutes(env.buildTarget));
const queryClient = createQueryClient();

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <AppProviders queryClient={queryClient}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
}
