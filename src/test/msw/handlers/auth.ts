import { http } from 'msw';

import type { SessionUser } from '@features/auth';

import { certifiedDormRoom, mswAccessToken, sessionUserBase } from '../fixtures/session';
import { getSessionScenario } from '../scenarios/session';
import { fail, ok } from './envelope';

function currentUser(): SessionUser | null {
  const scenario = getSessionScenario();
  if (scenario.session === 'anonymous') return null;
  if (scenario.session === 'onboarding') return { ...sessionUserBase, dormRoom: null, stage: scenario.stage };
  return { ...sessionUserBase, dormRoom: certifiedDormRoom, stage: 'certified' };
}

interface AuthHandlerOptions {
  // 테스트에서 재발급을 일부러 실패시킬 때 'fail'
  refresh?: 'ok' | 'fail';
}

// 인증 API 흉내: 재발급·상태 조회·카카오 코드 교환·로그아웃·탈퇴 (1학기 경로)
export function createAuthHandlers({ refresh = 'ok' }: AuthHandlerOptions = {}) {
  return [
    http.post('*/api/auth/refresh', () => {
      if (refresh === 'fail' || !currentUser()) return fail(401, 'UNAUTHORIZED', '다시 로그인해 주세요.');
      return ok({ accessToken: mswAccessToken });
    }),
    http.get('*/api/auth/status', ({ request }) => {
      const user = currentUser();
      if (!user || request.headers.get('Authorization') !== `Bearer ${mswAccessToken}`) {
        return fail(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
      }
      return ok(user);
    }),
    http.get('*/api/auth/kakao/callback', () => ok({ accessToken: mswAccessToken })),
    http.post('*/api/auth/logout', () => ok(null)),
    http.delete('*/api/users/me', () => ok(null)),
  ];
}

export const authHandlers = createAuthHandlers();
