import { isInternalPath } from './returnPath';

// 앱이 받은 주소(App Links·Universal Links)를 앱 안 경로로 바꾼다. 받을 수 없는 주소면 null.
// 받는 주소는 https이고 도메인이 allowedHost와 같은 것뿐이다(카카오 redirect URI의 도메인).
export function deepLinkPath(url: string, allowedHost: string | null): string | null {
  if (!allowedHost) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || parsed.host !== allowedHost) return null;
  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  return isInternalPath(path) ? path : null;
}

// 설정 주소에서 도메인만 꺼낸다. 비었거나 형식이 틀리면 null(딥링크를 받지 않음).
export function hostOf(url: string): string | null {
  try {
    return new URL(url).host || null;
  } catch {
    return null;
  }
}
