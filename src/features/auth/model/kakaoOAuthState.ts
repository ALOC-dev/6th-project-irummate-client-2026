// 카카오 로그인 위조 요청 방지용 일회용 state 값(1학기에 없던 보호).
// 로그인을 시작할 때 무작위 값을 만들어 카카오 인증 주소에 붙이고, 돌아온 주소의 값과 대조한다.
// 카카오 페이지에 다녀오는 동안 웹 페이지가 새로 로드되므로 메모리가 아닌 sessionStorage에 둔다.
// 로그인 토큰이 아니라 "이 요청은 내가 시작했다"는 표시라 토큰 저장 금지 규칙에 해당하지 않는다. 대조하면 바로 지운다.
const STORAGE_KEY = 'irummate.kakaoOAuthState';

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const kakaoOAuthState = {
  // 새 값을 만들어 저장하고 돌려준다. 이전에 시작한 로그인의 값은 덮어쓴다.
  issue(): string {
    const state = randomState();
    try {
      window.sessionStorage.setItem(STORAGE_KEY, state);
    } catch {
      // 저장하지 못하면 돌아왔을 때 대조에 실패해 로그인 화면으로 돌아간다.
    }
    return state;
  },
  // 돌아온 값이 저장한 값과 같은지 본다. 결과와 상관없이 저장한 값은 지운다(재사용 차단).
  consume(received: string | null): boolean {
    let saved: string | null = null;
    try {
      saved = window.sessionStorage.getItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      return false;
    }
    return Boolean(saved) && saved === received;
  },
};
