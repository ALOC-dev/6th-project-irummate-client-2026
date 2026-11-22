// 로그인 전에 가려던 앱 안 경로. 로그인을 마치면 그 화면으로 돌려보낸다.
// 카카오에 다녀오는 동안 페이지가 새로 로드되어 라우터 상태로는 남지 않으므로 sessionStorage에 하나만 둔다.
// 경로만 담고 토큰·개인정보는 담지 않는다.
const STORAGE_KEY = 'irummate.returnPath';

// 앱 안 경로만 받는다. '//evil.com'·'/\evil.com'처럼 다른 사이트로 해석될 수 있는 값은 버린다(열린 리다이렉트 방지).
export function isInternalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
}

export const returnPath = {
  remember(path: string): void {
    if (!isInternalPath(path)) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, path);
    } catch {
      // 기억하지 못하면 로그인 후 단계 첫 화면으로 간다.
    }
  },
  peek(): string | null {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      return saved && isInternalPath(saved) ? saved : null;
    } catch {
      return null;
    }
  },
  clear(): void {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // 지울 수 없으면 지울 것도 없다.
    }
  },
};
