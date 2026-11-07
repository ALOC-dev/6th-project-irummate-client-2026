// 1학기 src/auth/tokenStorage.js 이식. 저장 위치를 localStorage에서 메모리로 바꿨다.
// 접근 토큰은 이 모듈 변수에만 둔다. 기기 저장소(localStorage·Preferences·보안 저장소)에 쓰지 않는다.
// 앱을 다시 열면 비어 있으므로 AuthContext가 시작 시 재발급으로 채운다.
let accessToken: string | null = null;

export const tokenStorage = {
  get(): string | null {
    return accessToken;
  },
  set(token: string): void {
    if (!token) throw new Error('저장할 접근 토큰이 없습니다.');
    accessToken = token;
  },
  clear(): void {
    accessToken = null;
  },
};
