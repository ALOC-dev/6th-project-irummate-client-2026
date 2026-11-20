// 통신 클라이언트의 토큰 첨부·401 재발급·재시도·로그아웃 규칙을 MSW로 확인한다.
// shared 계층 테스트라 features/auth를 쓰지 않고, 가짜 인증 핸들러를 테스트마다 새로 등록한다.
import { delay, http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fail, ok } from '@test/msw/handlers/envelope';
import { server } from '@test/msw/server';

import { apiClient, refreshAccessToken, registerAuthHandlers, type AuthHandlers } from './client';
import { isAppError, type AppError } from './errors';

const OLD_TOKEN = 'old-token';
const NEW_TOKEN = 'new-token';
const PROBE = '*/api/test/probe';
const REFRESH = '*/api/auth/refresh';

let token: string | null;
let handlers: { [K in keyof AuthHandlers]: ReturnType<typeof vi.fn> } & AuthHandlers;

function createHandlers() {
  return {
    getAccessToken: vi.fn(() => token),
    setAccessToken: vi.fn((next: string) => {
      token = next;
    }),
    clearAccessToken: vi.fn(() => {
      token = null;
    }),
    onAuthExpired: vi.fn(),
    onTokenRefreshed: vi.fn(),
  };
}

beforeEach(() => {
  token = OLD_TOKEN;
  handlers = createHandlers();
  registerAuthHandlers(handlers);
});

// 새 토큰이 실린 요청만 통과시키는 보호된 API
function protectedProbe(seen: string[] = []) {
  return http.get(PROBE, ({ request }) => {
    const authorization = request.headers.get('Authorization') ?? '';
    seen.push(authorization);
    if (authorization !== `Bearer ${NEW_TOKEN}`) return fail(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
    return ok({ value: 'done' });
  });
}

// 재발급 요청 횟수를 세는 핸들러. 동시 요청이 겹치도록 응답을 조금 늦춘다.
function countingRefresh(counter: { count: number }) {
  return http.post(REFRESH, async () => {
    counter.count += 1;
    await delay(30);
    return ok({ accessToken: NEW_TOKEN });
  });
}

async function catchAppError(promise: Promise<unknown>): Promise<AppError> {
  try {
    await promise;
  } catch (error) {
    if (isAppError(error)) return error;
    throw new Error(`AppError가 아닌 오류: ${String(error)}`);
  }
  throw new Error('오류가 나야 하는데 성공했다');
}

describe('요청 인터셉터', () => {
  it('토큰이 있으면 Bearer 헤더를 붙인다', async () => {
    const seen: string[] = [];
    server.use(
      http.get(PROBE, ({ request }) => {
        seen.push(request.headers.get('Authorization') ?? '');
        return ok(null);
      }),
    );

    await apiClient.get('/api/test/probe');

    expect(seen).toEqual([`Bearer ${OLD_TOKEN}`]);
  });
});

describe('401 → 재발급 → 재시도', () => {
  it('재발급에 성공하면 새 토큰으로 한 번 재시도해 성공한다', async () => {
    const seen: string[] = [];
    const refresh = { count: 0 };
    server.use(protectedProbe(seen), countingRefresh(refresh));

    const response = await apiClient.get<{ data: { value: string } }>('/api/test/probe');

    expect(response.status).toBe(200);
    expect(response.data.data.value).toBe('done');
    expect(seen).toEqual([`Bearer ${OLD_TOKEN}`, `Bearer ${NEW_TOKEN}`]);
    expect(refresh.count).toBe(1);
    expect(handlers.setAccessToken).toHaveBeenCalledWith(NEW_TOKEN);
    expect(handlers.onTokenRefreshed).toHaveBeenCalledTimes(1);
    expect(handlers.onAuthExpired).not.toHaveBeenCalled();
  });

  it('동시에 401을 받은 요청 3개는 재발급을 한 번만 하고 모두 성공한다', async () => {
    const refresh = { count: 0 };
    server.use(protectedProbe(), countingRefresh(refresh));

    const responses = await Promise.all([
      apiClient.get('/api/test/probe'),
      apiClient.get('/api/test/probe'),
      apiClient.get('/api/test/probe'),
    ]);

    expect(responses.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(refresh.count).toBe(1);
    expect(handlers.onTokenRefreshed).toHaveBeenCalledTimes(1);
  });

  it('재시도한 요청이 또 401이면 다시 재발급하지 않고 만료 처리한다', async () => {
    const refresh = { count: 0 };
    server.use(
      http.get(PROBE, () => fail(401, 'UNAUTHORIZED', '로그인이 필요합니다.')),
      countingRefresh(refresh),
    );

    const error = await catchAppError(apiClient.get('/api/test/probe'));

    expect(error.kind).toBe('auth');
    expect(refresh.count).toBe(1);
    expect(handlers.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(handlers.onAuthExpired).toHaveBeenCalledTimes(1);
    expect(token).toBeNull();
  });
});

describe('재발급 실패', () => {
  it.each([
    [401, 'auth'],
    [403, 'forbidden'],
  ] as const)('재발급이 %i이면 토큰을 지우고 만료를 알린다', async (status, kind) => {
    server.use(
      protectedProbe(),
      http.post(REFRESH, () => fail(status, 'UNAUTHORIZED', '다시 로그인해 주세요.')),
    );

    const error = await catchAppError(apiClient.get('/api/test/probe'));

    expect(error.kind).toBe(kind);
    expect(error.status).toBe(status);
    expect(handlers.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(handlers.onAuthExpired).toHaveBeenCalledTimes(1);
    expect(handlers.setAccessToken).not.toHaveBeenCalled();
    expect(token).toBeNull();
  });

  it('재발급이 네트워크 오류면 로그아웃하지 않는다', async () => {
    server.use(
      protectedProbe(),
      http.post(REFRESH, () => HttpResponse.error()),
    );

    const error = await catchAppError(apiClient.get('/api/test/probe'));

    expect(error.kind).toBe('network');
    expect(handlers.clearAccessToken).not.toHaveBeenCalled();
    expect(handlers.onAuthExpired).not.toHaveBeenCalled();
    expect(token).toBe(OLD_TOKEN);
  });

  it('재발급 응답에 토큰이 없으면 오류를 던지고 로그아웃하지 않는다', async () => {
    server.use(http.post(REFRESH, () => ok({})));

    const error = await catchAppError(refreshAccessToken());

    expect(handlers.setAccessToken).not.toHaveBeenCalled();
    expect(handlers.onTokenRefreshed).not.toHaveBeenCalled();
    expect(handlers.clearAccessToken).not.toHaveBeenCalled();
    expect(handlers.onAuthExpired).not.toHaveBeenCalled();
    expect(error.kind).toBe('server');
    expect(error.message).toBe('잠시 후 다시 시도해 주세요.');
  });
});

describe('401이 아닌 오류', () => {
  it('500이면 재발급하지 않고 서버 오류로 바꿔 던진다', async () => {
    const refresh = { count: 0 };
    server.use(
      http.get(PROBE, () => fail(500, 'INTERNAL_ERROR', '서버 오류')),
      countingRefresh(refresh),
    );

    const error = await catchAppError(apiClient.get('/api/test/probe'));

    expect(error.kind).toBe('server');
    expect(error.status).toBe(500);
    expect(refresh.count).toBe(0);
    expect(handlers.onAuthExpired).not.toHaveBeenCalled();
  });
});

describe('재발급 공유 해제', () => {
  it('재발급이 끝난 뒤 다시 부르면 새 재발급 요청을 보낸다', async () => {
    const refresh = { count: 0 };
    server.use(countingRefresh(refresh));

    await refreshAccessToken();
    await refreshAccessToken();

    expect(refresh.count).toBe(2);
  });
});
