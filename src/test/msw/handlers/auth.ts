import { http } from 'msw';

import { mswAccessToken, serverUserBase } from '../fixtures/session';
import { getSessionScenario, type SessionScenario } from '../scenarios/session';
import { fail, ok } from './envelope';

// 시나리오 → 서버 user 필드. 단계는 클라이언트의 판정 함수가 이 값으로 정한다.
// termsAgreed는 2학기 서버에 아직 없는 필드다. 약관 이후 단계를 흉내 내려고 MSW만 미리 보낸다(ADR 0004).
// 소개 완료 표시는 서버가 모르는 기기 값이라 시나리오가 따로 채운다(scenarios/session.ts).
function serverUser(scenario: Exclude<SessionScenario, { session: 'anonymous' }>) {
  if (scenario.session === 'certified') {
    return { ...serverUserBase, detailsCompleted: true, certificationStatus: 'APPROVED' };
  }
  if (scenario.session === 'pending') {
    return { ...serverUserBase, detailsCompleted: true, certificationStatus: 'PENDING' };
  }
  switch (scenario.stage) {
    case 'terms':
      return { ...serverUserBase, termsAgreed: false };
    case 'intro':
    case 'profile':
      return { ...serverUserBase, termsAgreed: true };
    case 'certification':
      return { ...serverUserBase, detailsCompleted: true };
  }
}

interface AuthHandlerOptions {
  // 테스트에서 재발급을 일부러 실패시킬 때 'fail'
  refresh?: 'ok' | 'fail';
}

// 인증 API 흉내: 재발급·상태 조회·카카오 코드 교환·로그아웃·탈퇴 (2학기 서버 경로·응답 모양)
export function createAuthHandlers({ refresh = 'ok' }: AuthHandlerOptions = {}) {
  return [
    http.post('*/api/auth/refresh', () => {
      // 비로그인은 재발급 쿠키가 없는 상태라 401이다.
      if (refresh === 'fail' || getSessionScenario().session === 'anonymous') {
        return fail(401, 'UNAUTHORIZED', '다시 로그인해 주세요.');
      }
      return ok({ accessToken: mswAccessToken, tokenType: 'Bearer' });
    }),
    http.get('*/api/auth/status', ({ request }) => {
      if (request.headers.get('Authorization') !== `Bearer ${mswAccessToken}`) {
        return fail(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
      }
      const scenario = getSessionScenario();
      // 서버와 같이 비로그인은 200 + authenticated: false
      if (scenario.session === 'anonymous') return ok({ authenticated: false, user: null });
      return ok({ authenticated: true, user: serverUser(scenario) });
    }),
    http.get('*/api/auth/kakao/callback', () => ok({ accessToken: mswAccessToken })),
    http.post('*/api/auth/logout', () => ok(null)),
    http.delete('*/api/users/me', () => ok(null)),
  ];
}

export const authHandlers = createAuthHandlers();
