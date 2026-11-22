import { screen } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { paths } from '@app/router/paths';
import { fail } from '@test/msw/handlers/envelope';
import { setSessionScenario } from '@test/msw/scenarios/session';
import { server } from '@test/msw/server';
import { renderWithProviders } from '@test/renderWithProviders';

// 로그인 시작(useKakaoLogin)이 남기는 state를 흉내 낸다. 값은 kakaoOAuthState와 같은 저장소에 둔다.
function startLogin(): string {
  const state = 'test-state-0123456789abcdef';
  window.sessionStorage.setItem('irummate.kakaoOAuthState', state);
  return state;
}

function callbackUrl(params: Record<string, string>): string {
  return `${paths.kakaoCallback}?${new URLSearchParams(params).toString()}`;
}

async function expectScreen(screenId: string, pathname: string, router: { state: { location: { pathname: string } } }) {
  // 성공 흐름은 요청 3번(재발급·코드 교환·상태 조회)과 화면 지연 로딩을 거쳐 전체 테스트를 함께 돌리면 1초를 넘길 수 있다.
  expect(await screen.findByRole('heading', { name: new RegExp(`^${screenId} `) }, { timeout: 5000 })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe(pathname);
}

describe('KakaoCallbackPage', () => {
  it('코드 교환 성공 → 가입 단계 첫 화면(인증 완료면 홈)', async () => {
    setSessionScenario({ session: 'anonymous' });
    const state = startLogin();
    const { router } = renderWithProviders({ route: callbackUrl({ code: 'auth-code', state }) });

    await expectScreen('HM-01', paths.home, router);
  });

  it('state가 다르면 코드를 교환하지 않고 로그인 화면으로', async () => {
    setSessionScenario({ session: 'anonymous' });
    startLogin();
    const exchange = vi.fn();
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/api/auth/kakao/callback')) exchange();
    });
    const { router } = renderWithProviders({ route: callbackUrl({ code: 'auth-code', state: 'forged' }) });

    await expectScreen('ON-01', paths.login, router);
    expect(exchange).not.toHaveBeenCalled();
    server.events.removeAllListeners();
  });

  it('카카오 화면에서 취소하면 로그인 화면으로', async () => {
    setSessionScenario({ session: 'anonymous' });
    const state = startLogin();
    const { router } = renderWithProviders({ route: callbackUrl({ error: 'access_denied', state }) });

    await expectScreen('ON-01', paths.login, router);
  });

  it('코드 교환이 실패하면 로그인 화면으로', async () => {
    setSessionScenario({ session: 'anonymous' });
    server.use(http.get('*/api/auth/kakao/callback', () => fail(400, 'BAD_REQUEST', '입력값이 유효하지 않습니다.')));
    const state = startLogin();
    const { router } = renderWithProviders({ route: callbackUrl({ code: 'used-code', state }) });

    await expectScreen('ON-01', paths.login, router);
  });

  it('가입 중인 사용자는 가입 단계 화면으로', async () => {
    setSessionScenario({ session: 'onboarding', stage: 'terms' });
    const state = startLogin();
    const { router } = renderWithProviders({ route: callbackUrl({ code: 'auth-code', state }) });

    await expectScreen('ON-02', paths.onboarding.terms, router);
  });
});
