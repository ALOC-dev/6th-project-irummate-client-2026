import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { setSessionScenario } from '@test/msw/scenarios/session';
import { renderWithProviders } from '@test/renderWithProviders';

import { paths } from '../router/paths';
import { createRoutes } from '../router/routes';
import { RouteErrorBoundary } from './RouteErrorBoundary';

function Broken(): never {
  throw new Error('render failed with token=secret-value');
}

describe('RouteErrorBoundary', () => {
  it('화면 예외를 잡아 다시 시도·홈으로를 보이고 오류 내용은 보이지 않는다', async () => {
    // React가 잡은 예외를 콘솔에 남기는 것만 막는다.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders({
      route: '/broken',
      routes: [{ path: '/broken', element: <Broken />, errorElement: <RouteErrorBoundary /> }],
    });

    expect(await screen.findByRole('heading', { name: '화면을 불러오지 못했어요' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '홈으로' })).toBeInTheDocument();
    expect(screen.queryByText(/secret-value/)).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('홈으로를 누르면 첫 화면으로 간다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    setSessionScenario({ session: 'certified' });
    const { router } = renderWithProviders({
      route: '/broken',
      routes: [{ path: '/broken', element: <Broken />, errorElement: <RouteErrorBoundary /> }, ...createRoutes('app')],
    });

    (await screen.findByRole('button', { name: '홈으로' })).click();

    expect(await screen.findByRole('heading', { name: /^HM-01 / })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.home);
    vi.restoreAllMocks();
  });

  it('가장 바깥 라우트마다 오류 화면이 있다', () => {
    for (const target of ['app', 'admin-web'] as const) {
      expect(createRoutes(target).every((route) => route.errorElement)).toBe(true);
    }
  });
});
