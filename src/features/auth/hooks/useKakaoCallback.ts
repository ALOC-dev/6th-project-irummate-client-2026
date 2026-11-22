import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { toAppError, type AppError } from '@shared/api';

import { kakaoCallback } from '../api/authApi';
import { kakaoOAuthState } from '../model/kakaoOAuthState';
import type { SessionUser } from '../model/types';
import { useAuthActions } from './useAuthActions';

// cancelled: 사용자가 카카오 화면에서 취소함. invalid: 코드가 없거나 state가 맞지 않음(위조·만료·다른 탭).
// failed: 코드 교환이나 사용자 확인이 실패함(error에 앱 오류).
export type KakaoCallbackFailure = 'cancelled' | 'invalid' | 'failed';

export type KakaoCallbackResult =
  | { status: 'pending' }
  | { status: 'success'; user: SessionUser }
  | { status: 'error'; reason: KakaoCallbackFailure; error?: AppError };

// 카카오가 돌려보낸 주소(?code=…&state=…)를 처리한다. 화면 이동은 호출한 화면이 결과를 보고 한다.
export function useKakaoCallback(): KakaoCallbackResult {
  const { search } = useLocation();
  const { completeLogin } = useAuthActions();
  const [result, setResult] = useState<KakaoCallbackResult>({ status: 'pending' });
  // 1학기 방식: 개발 모드(StrictMode)에서 effect가 두 번 돌아도 코드 교환은 한 번만 한다. 인가 코드는 일회용이다.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const params = new URLSearchParams(search);
    const code = params.get('code');
    // state는 결과와 상관없이 여기서 지운다(같은 값으로 다시 들어오지 못하게).
    const stateMatched = kakaoOAuthState.consume(params.get('state'));

    if (params.get('error')) {
      setResult({ status: 'error', reason: 'cancelled' });
      return;
    }
    if (!code || !stateMatched) {
      setResult({ status: 'error', reason: 'invalid' });
      return;
    }

    kakaoCallback(code)
      .then((accessToken) => completeLogin(accessToken))
      .then((user) => setResult({ status: 'success', user }))
      .catch((error: unknown) => setResult({ status: 'error', reason: 'failed', error: toAppError(error) }));
  }, [search, completeLogin]);

  return result;
}
