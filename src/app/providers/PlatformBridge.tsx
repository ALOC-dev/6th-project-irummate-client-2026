import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useRevalidateSession } from '@features/auth';
import { env } from '@shared/config/env';
import { appLifecycle, backButton, deepLink, externalBrowser } from '@shared/platform';
import { Toast } from '@shared/ui';

import { backActionFor } from '../router/backAction';
import { deepLinkPath, hostOf } from '../router/deepLinkPath';
import { paths } from '../router/paths';

// 뒤로가기를 한 번 더 눌러 앱을 끄는 시간(ms). 안내 문구도 이 시간만큼 보인다.
const EXIT_WINDOW_MS = 2000;

// 데이터 라우터는 기록마다 idx를 남긴다. 0이면 이 앱에서 처음 연 화면이라 뒤로 갈 곳이 없다.
function canGoBack(): boolean {
  const state: unknown = window.history.state;
  if (typeof state !== 'object' || state === null || !('idx' in state)) return false;
  return typeof state.idx === 'number' && state.idx > 0;
}

function isKakaoCallback(path: string): boolean {
  return path === paths.kakaoCallback || path.startsWith(`${paths.kakaoCallback}?`);
}

// 기기 동작(뒤로가기 버튼·앱 복귀·앱 연결 주소)을 라우터·세션·쿼리에 잇는 루트 라우트 화면.
// 기기 쪽 차이는 shared/platform 어댑터가 숨기고, 여기서는 앱이 할 일만 정한다.
export function PlatformBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const revalidateSession = useRevalidateSession();
  const [exitToastOpen, setExitToastOpen] = useState(false);
  const lastExitPressRef = useRef(0);

  // 구독은 한 번만 하고, 처리할 때는 가장 최근 값을 읽는다.
  const latest = useRef({ location, navigate, queryClient, revalidateSession });
  useEffect(() => {
    latest.current = { location, navigate, queryClient, revalidateSession };
  });

  useEffect(() => {
    const unsubscribeBack = backButton.subscribe(() => {
      const { location: current, navigate: go } = latest.current;
      const action = backActionFor({ pathname: current.pathname, search: current.search, canGoBack: canGoBack() });
      if (action.type === 'history-back') {
        void go(-1);
        return;
      }
      if (action.type === 'navigate') {
        void go(action.to, { replace: true });
        return;
      }
      const now = Date.now();
      if (now - lastExitPressRef.current < EXIT_WINDOW_MS) {
        void backButton.exitApp();
        return;
      }
      lastExitPressRef.current = now;
      setExitToastOpen(true);
    });

    // 로그인된 상태일 때만 세션을 다시 확인하고, 유효하면 열린 화면의 데이터를 다시 받는다.
    // 확인이 실패해도(연결 끊김 등) 지금 화면과 데이터는 그대로 둔다.
    const unsubscribeResume = appLifecycle.onResume(() => {
      const { revalidateSession: revalidate, queryClient: client } = latest.current;
      void revalidate().then((valid) => {
        if (valid) void client.invalidateQueries();
      });
    });

    const unsubscribeDeepLink = deepLink.onOpen((url) => {
      // 카카오 redirect URI와 같은 도메인의 주소만 받는다.
      const path = deepLinkPath(url, hostOf(env.kakaoRedirectUri));
      if (!path) return;
      const { navigate: go } = latest.current;
      if (isKakaoCallback(path)) {
        // 카카오 로그인을 띄운 앱 안 브라우저를 닫고, 콜백 화면이 로그인을 마친다.
        // 로그인 화면 대신 콜백이 들어서도록 바꿔 끼워, 뒤로가기로 로그인 화면에 돌아오지 않게 한다.
        void externalBrowser.close();
        void go(path, { replace: true });
        return;
      }
      void go(path);
    });

    return () => {
      unsubscribeBack();
      unsubscribeResume();
      unsubscribeDeepLink();
    };
  }, []);

  return (
    <>
      <Outlet />
      <Toast open={exitToastOpen} duration={EXIT_WINDOW_MS} onDismiss={() => setExitToastOpen(false)}>
        한 번 더 누르면 앱이 종료돼요
      </Toast>
    </>
  );
}
