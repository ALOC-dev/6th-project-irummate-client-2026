// 임시 시험 화면. 병합하지 않고 시험이 끝나면 지운다. (재발급 쿠키 ① 기기 시험)
import { useState } from 'react';

import { apiClient, isAppError, publicClient, refreshAccessToken, registerAuthHandlers } from '@shared/api';
import type { AuthHandlers } from '@shared/api';
import { env } from '@shared/config/env';

type Result = { label: string; text: string };

async function call(label: string, path: string, method: 'GET' | 'POST'): Promise<Result> {
  try {
    const res = await fetch(`${env.apiBaseUrl}${path}`, { method, credentials: 'include' });
    const body = (await res.json().catch(() => null)) as { message?: string; data?: { accessToken?: string } } | null;
    const hasToken = Boolean(body?.data?.accessToken);
    return { label, text: `status=${res.status} accessToken=${hasToken ? '있음' : '없음'} message=${body?.message ?? '-'}` };
  } catch (error) {
    return { label, text: `요청 실패: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// WebView가 직접 여는 WebSocket은 네이티브 HTTP를 거치지 않는다. 앱 출처(Origin) 검사를 확인한다.
function probeSocket(): Promise<Result> {
  const url = `${env.apiBaseUrl.replace(/^http/, 'ws')}/ws/chat/websocket`;
  return new Promise((resolve) => {
    let opened = false;
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      ws.close();
      resolve({ label: '소켓', text: '10초 안에 응답 없음' });
    }, 10000);
    ws.onopen = () => {
      opened = true;
      clearTimeout(timer);
      ws.close();
      resolve({ label: '소켓', text: '연결 성공(열림)' });
    };
    ws.onclose = (e) => {
      clearTimeout(timer);
      if (!opened) resolve({ label: '소켓', text: `연결 실패 close code=${e.code}` });
    };
  });
}

// ── axios 경로 시험: 앱이 실제로 쓰는 shared/api 클라이언트를 그대로 호출한다 ──
// 토큰은 이 파일의 메모리 변수에만 둔다. 화면에는 값을 찍지 않고 있음/없음만 보인다.
let memToken: string | null = null;
let refreshedCount = 0;
let expiredCount = 0;

// app/main.tsx가 이 모듈을 불러온 뒤 실제 앱의 보관함을 등록해 덮어쓰므로, 버튼을 누를 때마다 다시 등록한다.
const probeHandlers: AuthHandlers = {
  getAccessToken: () => memToken,
  setAccessToken: (token) => {
    memToken = token;
  },
  clearAccessToken: () => {
    memToken = null;
  },
  onAuthExpired: () => {
    expiredCount += 1;
  },
  onTokenRefreshed: () => {
    refreshedCount += 1;
  },
};

function activateProbeHandlers(): void {
  registerAuthHandlers(probeHandlers);
}

function describeError(error: unknown): string {
  if (isAppError(error)) return `실패 kind=${error.kind} status=${error.status ?? '-'}`;
  return `실패 ${error instanceof Error ? error.name : 'unknown'}`;
}

async function axiosExchange(code: string): Promise<Result> {
  activateProbeHandlers();
  try {
    const res = await publicClient.get<{ data?: { accessToken?: string } }>('/api/auth/kakao/callback', {
      params: { code },
    });
    const token = res.data?.data?.accessToken;
    if (token) memToken = token;
    return { label: 'axios 교환', text: `status=${res.status} accessToken=${token ? '있음' : '없음'}` };
  } catch (error) {
    return { label: 'axios 교환', text: describeError(error) };
  }
}

async function axiosRefresh(): Promise<Result> {
  activateProbeHandlers();
  try {
    const token = await refreshAccessToken();
    return { label: 'axios 재발급', text: `성공 accessToken=${token ? '있음' : '없음'}` };
  } catch (error) {
    return { label: 'axios 재발급', text: describeError(error) };
  }
}

// 틀린 토큰으로 인증이 필요한 API를 불러 401 → 재발급 → 재시도가 이어지는지 본다.
// 빌드 도구가 비교를 미리 계산하지 못하도록 값 읽기를 함수로 분리한다.
function readMemToken(): string | null {
  return memToken;
}

async function axios401Retry(): Promise<Result> {
  activateProbeHandlers();
  const sentinel = 'invalid-token-for-probe';
  memToken = sentinel;
  const refreshedBefore = refreshedCount;
  const expiredBefore = expiredCount;
  try {
    const res = await apiClient.get('/api/users/me');
    const after = readMemToken();
    const state = after === null ? '없음' : after === sentinel ? '그대로(틀린 값)' : '새 토큰';
    return {
      label: 'axios 401 재시도',
      text: `최종 status=${res.status} 재발급횟수=${refreshedCount - refreshedBefore} 만료알림=${expiredCount - expiredBefore} 저장된토큰=${state}`,
    };
  } catch (error) {
    return {
      label: 'axios 401 재시도',
      text: `${describeError(error)} 재발급횟수=${refreshedCount - refreshedBefore} 만료알림=${expiredCount - expiredBefore}`,
    };
  }
}

export default function CookieProbe() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const add = (r: Result) => setResults((prev) => [r, ...prev].slice(0, 10));

  return (
    <div style={{ padding: 16, paddingTop: 48 }}>
      <p>API: {env.apiBaseUrl || '(비어 있음)'}</p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.trim())}
        placeholder="카카오 code 붙여넣기"
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />
      <div style={{ display: 'grid', gap: 8 }}>
        <button onClick={() => void call('로그인 교환', `/api/auth/kakao/callback?code=${encodeURIComponent(code)}`, 'GET').then(add)}>
          1. 로그인 교환
        </button>
        <button onClick={() => void call('재발급', '/api/auth/refresh', 'POST').then(add)}>2. 재발급</button>
        <button onClick={() => add({ label: '쿠키 읽기', text: `document.cookie = "${document.cookie}"` })}>
          3. 쿠키 읽기(refreshToken이 안 보여야 통과)
        </button>
        <button onClick={() => void probeSocket().then(add)}>4. 소켓 연결(/ws/chat)</button>
        <button onClick={() => void axiosExchange(code).then(add)}>5. axios 로그인 교환(code 필요)</button>
        <button onClick={() => void axiosRefresh().then(add)}>6. axios 재발급</button>
        <button onClick={() => void axios401Retry().then(add)}>7. axios 401 재시도(/api/users/me)</button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
        {results.map((r) => `[${r.label}] ${r.text}`).join('\n')}
      </pre>
    </div>
  );
}
