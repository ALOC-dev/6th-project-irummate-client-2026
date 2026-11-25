import { act, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { env } from '@shared/config/env';
import { appLifecycle, backButton, deepLink, externalBrowser } from '@shared/platform';
import { setSessionScenario } from '@test/msw/scenarios/session';
import { server } from '@test/msw/server';
import { renderWithProviders } from '@test/renderWithProviders';

import { paths } from '../router/paths';

// 전체 테스트를 병렬로 돌리면 요청 왕복·화면 파일 로드가 1초를 넘기도 해, 기다리는 시간을 늘린다.
const slow = { timeout: 5000 };

// 기기 어댑터를 바꿔 끼워, 기기 이벤트를 테스트에서 직접 부른다.
let pressBack: () => void = () => {};
let resume: () => void = () => {};
let openUrl: (url: string) => void = () => {};
const originalRedirectUri = env.kakaoRedirectUri;

beforeEach(() => {
  vi.spyOn(backButton, 'subscribe').mockImplementation((handler) => {
    pressBack = handler;
    return () => {};
  });
  vi.spyOn(appLifecycle, 'onResume').mockImplementation((handler) => {
    resume = handler;
    return () => {};
  });
  vi.spyOn(deepLink, 'onOpen').mockImplementation((handler) => {
    openUrl = handler;
    return () => {};
  });
  // 받을 도메인은 카카오 redirect URI에서 온다. 로컬 .env와 상관없이 같은 값으로 시험한다.
  Object.assign(env, { kakaoRedirectUri: 'https://test.example.com/oauth/kakao/callback' });
});

afterEach(() => {
  Object.assign(env, { kakaoRedirectUri: originalRedirectUri });
  window.history.replaceState(null, '');
});

async function renderAt(route: string, session: 'certified' | 'anonymous' = 'certified') {
  setSessionScenario({ session });
  const view = renderWithProviders({ route });
  const heading = session === 'certified' ? /^HM-01 |^MC-01 |^CH-02 / : /^ON-01 /;
  await screen.findByRole('heading', { name: heading }, slow);
  // 화면이 DOM에 그려진 직후에는 PlatformBridge의 구독(effect)이 아직 돌지 않았을 수 있다. 구독이 끝난 뒤에 기기 이벤트를 보낸다.
  await waitFor(() => {
    expect(backButton.subscribe).toHaveBeenCalled();
    expect(appLifecycle.onResume).toHaveBeenCalled();
    expect(deepLink.onOpen).toHaveBeenCalled();
  }, slow);
  await act(async () => {});
  return view;
}

describe('PlatformBridge 뒤로가기', () => {
  it('홈에서 기록이 없으면 종료 안내를 띄우고, 한 번 더 누르면 앱을 끈다', async () => {
    const exitApp = vi.spyOn(backButton, 'exitApp').mockResolvedValue();
    await renderAt(paths.home);

    act(() => pressBack());
    expect(screen.getByRole('status')).toHaveTextContent('한 번 더 누르면 앱이 종료돼요');
    expect(exitApp).not.toHaveBeenCalled();

    act(() => pressBack());
    expect(exitApp).toHaveBeenCalledTimes(1);
  });

  it('다른 탭 루트에서 기록이 없으면 홈으로 간다', async () => {
    const { router } = await renderAt(paths.match);
    act(() => pressBack());
    await waitFor(() => expect(router.state.location.pathname).toBe(paths.home), slow);
  });

  it('기록이 있으면 이전 화면으로 간다', async () => {
    const { router } = await renderAt(paths.home);
    await act(() => router.navigate(paths.chatRoom('3')));
    // 브라우저 라우터가 남기는 기록 순번을 흉내 낸다(메모리 라우터는 window.history를 쓰지 않음).
    window.history.replaceState({ idx: 1 }, '');
    act(() => pressBack());
    await waitFor(() => expect(router.state.location.pathname).toBe(paths.home), slow);
  });
});

describe('PlatformBridge 앱 복귀', () => {
  it('로그인된 상태면 세션을 다시 확인하고 쿼리를 다시 받는다', async () => {
    const { queryClient } = await renderAt(paths.home);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const statusRequest = vi.fn();
    server.events.on('request:start', ({ request }) => {
      if (new URL(request.url).pathname === '/api/auth/status') statusRequest();
    });

    act(() => resume());
    await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(1), slow);
    expect(statusRequest).toHaveBeenCalledTimes(1);
    server.events.removeAllListeners();
  });

  it('비로그인이면 확인하지 않는다', async () => {
    const { queryClient } = await renderAt(paths.login, 'anonymous');
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const statusRequest = vi.fn();
    server.events.on('request:start', ({ request }) => {
      if (new URL(request.url).pathname === '/api/auth/status') statusRequest();
    });

    await act(async () => resume());
    expect(statusRequest).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
    server.events.removeAllListeners();
  });

  it('연결이 끊겨 실패하면 보던 화면과 데이터를 그대로 둔다', async () => {
    const { queryClient, router } = await renderAt(paths.home);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    let failed = false;
    server.use(
      http.get('*/api/auth/status', () => {
        failed = true;
        return HttpResponse.error();
      }),
    );

    act(() => resume());
    await waitFor(() => expect(failed).toBe(true), slow);
    // 실패가 상태에 반영될 시간을 준 뒤에도 홈이 그대로 있어야 한다.
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(screen.getByRole('heading', { name: /^HM-01 / })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.home);
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe('PlatformBridge 앱 연결 주소', () => {
  it('카카오 콜백이면 앱 안 브라우저를 닫고 콜백 화면으로 바꿔 끼운다', async () => {
    const close = vi.spyOn(externalBrowser, 'close').mockResolvedValue();
    const { router } = await renderAt(paths.login, 'anonymous');
    const navigate = vi.spyOn(router, 'navigate');

    act(() => openUrl('https://test.example.com/oauth/kakao/callback?code=c&state=s'));
    expect(close).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/oauth/kakao/callback?code=c&state=s', expect.objectContaining({ replace: true }));
  });

  it('같은 도메인의 다른 주소면 그 화면으로 간다', async () => {
    const close = vi.spyOn(externalBrowser, 'close').mockResolvedValue();
    const { router } = await renderAt(paths.home);
    act(() => openUrl('https://test.example.com/match'));
    await waitFor(() => expect(router.state.location.pathname).toBe(paths.match), slow);
    expect(close).not.toHaveBeenCalled();
  });

  it('다른 도메인의 주소는 무시한다', async () => {
    const close = vi.spyOn(externalBrowser, 'close').mockResolvedValue();
    const { router } = await renderAt(paths.home);
    const navigate = vi.spyOn(router, 'navigate');
    act(() => openUrl('https://evil.example.com/oauth/kakao/callback?code=c'));
    expect(navigate).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });
});
