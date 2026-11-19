// 임시 시험 화면. 병합하지 않고 시험이 끝나면 지운다. (재발급 쿠키 ① 기기 시험)
import { useState } from 'react';

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

export default function CookieProbe() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const add = (r: Result) => setResults((prev) => [r, ...prev].slice(0, 8));

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
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
        {results.map((r) => `[${r.label}] ${r.text}`).join('\n')}
      </pre>
    </div>
  );
}
