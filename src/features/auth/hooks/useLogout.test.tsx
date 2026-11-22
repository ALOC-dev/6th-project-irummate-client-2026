import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { registerAuthHandlers } from '@shared/api';
import { fail } from '@test/msw/handlers/envelope';
import { setSessionScenario } from '@test/msw/scenarios/session';
import { server } from '@test/msw/server';

import { AuthProvider } from '../model/AuthContext';
import { authClientBindings } from '../model/clientBindings';
import { tokenStorage } from '../model/tokenStorage';
import { useLogout } from './useLogout';
import { useSession } from './useSession';
import { useWithdraw } from './useWithdraw';

function setup() {
  registerAuthHandlers(authClientBindings);
  setSessionScenario({ session: 'certified' });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(['previous-user-data'], { secret: 'shown-to-previous-user' });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  const view = renderHook(() => ({ session: useSession(), logout: useLogout(), withdraw: useWithdraw() }), { wrapper });
  return { ...view, queryClient };
}

async function loggedIn() {
  const view = setup();
  await waitFor(() => expect(view.result.current.session.status).toBe('authenticated'));
  return view;
}

describe('useLogout', () => {
  it('서버 로그아웃 후 토큰·캐시를 비우고 비로그인이 된다', async () => {
    const { result, queryClient } = await loggedIn();

    await act(() => result.current.logout.logout());

    expect(result.current.session.status).toBe('anonymous');
    expect(tokenStorage.get()).toBeNull();
    expect(queryClient.getQueryData(['previous-user-data'])).toBeUndefined();
    expect(result.current.logout.isPending).toBe(false);
  });

  it('서버 요청이 네트워크로 실패해도 기기에서는 로그아웃한다', async () => {
    const { result } = await loggedIn();
    server.use(http.post('*/api/auth/logout', () => HttpResponse.error()));

    await act(() => result.current.logout.logout());

    expect(result.current.session.status).toBe('anonymous');
    expect(tokenStorage.get()).toBeNull();
  });
});

describe('useWithdraw', () => {
  it('성공하면 토큰·캐시를 비우고 비로그인이 된다', async () => {
    const { result, queryClient } = await loggedIn();

    await act(() => result.current.withdraw.withdraw());

    expect(result.current.session.status).toBe('anonymous');
    expect(tokenStorage.get()).toBeNull();
    expect(queryClient.getQueryData(['previous-user-data'])).toBeUndefined();
  });

  it('실패하면 오류를 던지고 로그인 상태를 유지한다', async () => {
    const { result, queryClient } = await loggedIn();
    server.use(http.delete('*/api/users/me', () => fail(500, 'INTERNAL_SERVER_ERROR', '서버 오류')));

    await act(async () => {
      await expect(result.current.withdraw.withdraw()).rejects.toMatchObject({ kind: 'server' });
    });

    expect(result.current.session.status).toBe('authenticated');
    expect(tokenStorage.get()).not.toBeNull();
    expect(queryClient.getQueryData(['previous-user-data'])).toBeDefined();
    expect(result.current.withdraw.isPending).toBe(false);
  });
});
