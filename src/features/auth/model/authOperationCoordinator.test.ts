// 1학기 src/auth/authOperationCoordinator.test.js 이식(node:test → vitest, 사례 5개 그대로).
import { describe, expect, it } from 'vitest';

import { createAuthOperationCoordinator } from './authOperationCoordinator';

interface TestUser {
  id: string;
  role: string;
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

type Commit = { state: 'authenticated'; user: TestUser | null | undefined } | { state: 'token-refreshed' } | { state: 'unauthenticated' };
type TokenChange = { type: 'set'; accessToken: string } | { type: 'remove' };

function createHarness(loadCurrentUser: () => Promise<TestUser | null | undefined>) {
  const commits: Commit[] = [];
  const tokenChanges: TokenChange[] = [];

  const coordinator = createAuthOperationCoordinator<TestUser>({
    commitAuthenticated: (user) => commits.push({ state: 'authenticated', user }),
    commitTokenRefreshed: () => commits.push({ state: 'token-refreshed' }),
    commitUnauthenticated: () => commits.push({ state: 'unauthenticated' }),
    loadCurrentUser,
    removeAccessToken: () => tokenChanges.push({ type: 'remove' }),
    setAccessToken: (accessToken) => tokenChanges.push({ type: 'set', accessToken }),
  });

  return { commits, coordinator, tokenChanges };
}

describe('authOperationCoordinator', () => {
  it('늦게 끝난 상태 확인과 이벤트가 새 로그인 결과를 덮어쓰지 못한다', async () => {
    const bootstrapUser = createDeferred<TestUser>();
    const loginUser = createDeferred<TestUser>();
    let loadCount = 0;
    const authenticatedUser = { id: 'new-user', role: 'USER' };
    const staleUser = { id: 'stale-user', role: 'USER' };
    const harness = createHarness(() => {
      loadCount += 1;
      return loadCount === 1 ? bootstrapUser.promise : loginUser.promise;
    });

    const bootstrapPromise = harness.coordinator.bootstrap();
    const loginPromise = harness.coordinator.completeLogin('new-access-token');

    harness.coordinator.handleAuthExpired();
    harness.coordinator.handleTokenRefreshed();
    bootstrapUser.resolve(staleUser);
    await bootstrapPromise;

    expect(harness.commits).toEqual([]);

    loginUser.resolve(authenticatedUser);

    expect(await loginPromise).toBe(authenticatedUser);
    expect(harness.commits).toEqual([{ state: 'authenticated', user: authenticatedUser }]);
  });

  it('로그인은 진행 중인 상태 확인이 끝난 뒤에 토큰을 넣고 사용자를 확인한다', async () => {
    const bootstrapUser = createDeferred<TestUser>();
    const loginUser = createDeferred<TestUser>();
    const order: string[] = [];
    let loadCount = 0;
    const bootstrapError = new Error('stale bootstrap failed');
    const authenticatedUser = { id: 'new-user', role: 'USER' };

    const coordinator = createAuthOperationCoordinator<TestUser>({
      commitAuthenticated: () => order.push('commit-authenticated'),
      commitTokenRefreshed: () => order.push('commit-token-refreshed'),
      commitUnauthenticated: () => order.push('commit-unauthenticated'),
      loadCurrentUser() {
        loadCount += 1;
        order.push(loadCount === 1 ? 'load-bootstrap' : 'load-login');
        return loadCount === 1 ? bootstrapUser.promise : loginUser.promise;
      },
      removeAccessToken: () => order.push('remove-token'),
      setAccessToken: () => order.push('set-token'),
    });

    const bootstrapPromise = coordinator.bootstrap();
    const loginPromise = coordinator.completeLogin('new-access-token');

    await Promise.resolve();
    expect(order).toEqual(['load-bootstrap']);

    bootstrapUser.reject(bootstrapError);
    await expect(bootstrapPromise).rejects.toBe(bootstrapError);
    await Promise.resolve();

    expect(order).toEqual(['load-bootstrap', 'set-token', 'load-login']);

    loginUser.resolve(authenticatedUser);
    expect(await loginPromise).toBe(authenticatedUser);
  });

  it('로그인 후 사용자가 없으면 새 토큰을 지우고 비로그인으로 두고 실패한다', async () => {
    const harness = createHarness(async () => null);

    await expect(harness.coordinator.completeLogin('invalid-access-token')).rejects.toThrow('현재 사용자');

    expect(harness.tokenChanges).toEqual([
      { type: 'set', accessToken: 'invalid-access-token' },
      { type: 'remove' },
    ]);
    expect(harness.commits).toEqual([{ state: 'unauthenticated' }]);
  });

  it('사용자 확인 오류는 되돌린 뒤 그대로 다시 던진다', async () => {
    const validationError = new Error('status request failed');
    const harness = createHarness(async () => {
      throw validationError;
    });

    await expect(harness.coordinator.completeLogin('new-access-token')).rejects.toBe(validationError);

    expect(harness.tokenChanges).toEqual([
      { type: 'set', accessToken: 'new-access-token' },
      { type: 'remove' },
    ]);
    expect(harness.commits).toEqual([{ state: 'unauthenticated' }]);
  });

  it('로그인을 시작한 뒤에는 상태 확인이 새로 시작되지 않는다', async () => {
    const loginUser = createDeferred<TestUser>();
    let loadCount = 0;
    const authenticatedUser = { id: 'new-user', role: 'USER' };
    const harness = createHarness(() => {
      loadCount += 1;
      return loginUser.promise;
    });

    const loginPromise = harness.coordinator.completeLogin('new-access-token');
    const bootstrapResult = await harness.coordinator.bootstrap();

    expect(bootstrapResult).toBeNull();
    expect(loadCount).toBe(1);

    loginUser.resolve(authenticatedUser);
    expect(await loginPromise).toBe(authenticatedUser);
    expect(loadCount).toBe(1);
  });
});
