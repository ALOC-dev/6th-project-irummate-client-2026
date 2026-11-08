import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

import { AppProviders } from '@app/providers/AppProviders';
import { createRoutes } from '@app/router/routes';
import { authClientBindings } from '@features/auth';
import { registerAuthHandlers } from '@shared/api';
import type { BuildTarget } from '@shared/config/env';

interface Options {
  route?: string;
  routes?: RouteObject[];
  target?: BuildTarget;
}

// 쿼리 클라이언트(테스트마다 새로, 재시도 끔) + 인증 + 메모리 라우터로 감싸 그린다.
export function renderWithProviders({ route = '/', routes, target = 'app' }: Options = {}) {
  registerAuthHandlers(authClientBindings);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(routes ?? createRoutes(target), { initialEntries: [route] });
  const view = render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...view, router, queryClient };
}
