import { useCallback, useState } from 'react';

import { paths } from '@app/router/paths';
import { env } from '@shared/config/env';
import { externalBrowser, runtime } from '@shared/platform';

import { kakaoOAuthState } from '../model/kakaoOAuthState';

const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize';

// 카카오 인증 주소. redirect_uri는 서버가 코드 교환에 쓰는 값과 같아야 한다(ADR 0003 결정 1).
export function buildKakaoAuthorizeUrl(state: string): string {
  const query = new URLSearchParams({
    client_id: env.kakaoClientId,
    redirect_uri: env.kakaoRedirectUri,
    response_type: 'code',
    state,
  });
  return `${KAKAO_AUTHORIZE_URL}?${query.toString()}`;
}

function assignLocation(url: string): void {
  window.location.assign(url);
}

export interface UseKakaoLoginOptions {
  // 현재 창 이동. 테스트에서 바꿔 끼운다(jsdom은 페이지 이동을 하지 못함).
  redirect?: (url: string) => void;
}

export interface KakaoLogin {
  login(): Promise<void>;
  isStarting: boolean;
}

// 카카오 인증 시작. 웹은 현재 창을 카카오로 이동하고, 앱은 외부 브라우저로 연다.
// 앱이 카카오에서 돌아오는 방식(App Links·Universal Links 또는 카카오 네이티브 로그인)은 아직 정하지 않았다.
// 정해지면 딥링크로 콜백 주소를 받아 KakaoCallbackPage로 보낸다.
export function useKakaoLogin({ redirect = assignLocation }: UseKakaoLoginOptions = {}): KakaoLogin {
  const [isStarting, setIsStarting] = useState(false);

  const login = useCallback(async () => {
    setIsStarting(true);
    const state = kakaoOAuthState.issue();
    try {
      // MSW 개발 모드: 카카오에 가지 않고 가짜 코드로 바로 콜백 화면에 간다.
      if (env.enableMocks) {
        redirect(`${paths.kakaoCallback}?${new URLSearchParams({ code: 'msw-code', state }).toString()}`);
        return;
      }
      const url = buildKakaoAuthorizeUrl(state);
      if (runtime.isNative()) {
        await externalBrowser.open(url);
        // 앱은 화면이 그대로 남는다. 사용자가 브라우저를 닫고 돌아와도 다시 누를 수 있게 한다.
        setIsStarting(false);
        return;
      }
      redirect(url);
    } catch (error) {
      setIsStarting(false);
      throw error;
    }
  }, [redirect]);

  return { login, isStarting };
}
