// 1학기 src/auth/authOperationCoordinator.js 이식(동작 그대로, 타입만 더함).
// 시작 시 상태 확인(bootstrap)과 카카오 로그인 완료(completeLogin)가 겹칠 때,
// 늦게 끝난 이전 작업의 결과가 새 로그인 결과를 덮어쓰지 못하게 한다.
// 앱에서는 카카오 로그인 중 앱 복귀 재조회가 끼어들 수 있어 더 중요하다.

export interface AuthOperationHandlers<TUser> {
  // 시작 시 상태 확인(bootstrap)은 1학기와 같이 사용자가 없어도(null) 결과를 그대로 넘긴다. 처리는 넘기는 쪽이 정한다.
  commitAuthenticated(user: TUser | null | undefined): void;
  commitTokenRefreshed(): void;
  commitUnauthenticated(): void;
  // 2학기 추가: 시작 시 상태 확인이 실패했을 때 오류를 보고 처리를 정한다(네트워크 끊김은 로그아웃하지 않음).
  // 넘기지 않으면 1학기와 같이 commitUnauthenticated를 부른다.
  commitBootstrapFailed?(error: unknown): void;
  loadCurrentUser(): Promise<TUser | null | undefined>;
  removeAccessToken(): void;
  setAccessToken(accessToken: string): void;
}

export interface AuthOperationCoordinator<TUser> {
  bootstrap(): Promise<TUser | null | undefined>;
  completeLogin(accessToken: string): Promise<TUser>;
  handleAuthExpired(): void;
  handleTokenRefreshed(): void;
}

export function createAuthOperationCoordinator<TUser>({
  commitAuthenticated,
  commitTokenRefreshed,
  commitUnauthenticated,
  commitBootstrapFailed = () => commitUnauthenticated(),
  loadCurrentUser,
  removeAccessToken,
  setAccessToken,
}: AuthOperationHandlers<TUser>): AuthOperationCoordinator<TUser> {
  let bootstrapPromise: Promise<TUser | null | undefined> | null = null;
  let hasLoginStarted = false;
  let isLoginInProgress = false;
  let operationVersion = 0;

  function isCurrentBootstrap(version: number): boolean {
    return version === operationVersion && !hasLoginStarted;
  }

  function bootstrap(): Promise<TUser | null | undefined> {
    if (hasLoginStarted) return Promise.resolve(null);
    if (bootstrapPromise) return bootstrapPromise;

    const version = ++operationVersion;
    const operationPromise = (async () => {
      try {
        const user = await loadCurrentUser();
        if (isCurrentBootstrap(version)) commitAuthenticated(user);
        return user;
      } catch (error) {
        if (isCurrentBootstrap(version)) commitBootstrapFailed(error);
        throw error;
      }
    })();

    bootstrapPromise = operationPromise;

    const clearBootstrap = () => {
      if (bootstrapPromise === operationPromise) bootstrapPromise = null;
    };
    operationPromise.then(clearBootstrap, clearBootstrap);

    return operationPromise;
  }

  async function completeLogin(accessToken: string): Promise<TUser> {
    hasLoginStarted = true;
    isLoginInProgress = true;
    operationVersion += 1;

    const pendingBootstrap = bootstrapPromise;

    try {
      if (pendingBootstrap) {
        try {
          await pendingBootstrap;
        } catch {
          // 이전 상태 확인의 결과는 버린다. 끝나기만 기다린다.
        }
      }

      setAccessToken(accessToken);

      const user = await loadCurrentUser();
      if (user === null || user === undefined) throw new Error('로그인 후 현재 사용자를 불러오지 못했습니다.');

      commitAuthenticated(user);
      return user;
    } catch (error) {
      removeAccessToken();
      commitUnauthenticated();
      throw error;
    } finally {
      isLoginInProgress = false;
    }
  }

  function handleAuthExpired(): void {
    if (isLoginInProgress) return;
    operationVersion += 1;
    commitUnauthenticated();
  }

  function handleTokenRefreshed(): void {
    if (isLoginInProgress) return;
    commitTokenRefreshed();
  }

  return { bootstrap, completeLogin, handleAuthExpired, handleTokenRefreshed };
}
