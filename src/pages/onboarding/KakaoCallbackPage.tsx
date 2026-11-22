import { Navigate } from 'react-router';

import { paths } from '@app/router/paths';
import { useKakaoCallback } from '@features/auth';

import { ScreenPlaceholder } from '../ScreenPlaceholder';

// 카카오가 돌려보낸 주소를 처리한다. 다음 화면은 직접 정하지 않고 첫 화면('/')으로 보내
// 가입 단계 판정(EntryRedirect)이 정하게 한다. 모든 이동은 히스토리를 대체해 뒤로가기로 이 화면에 돌아오지 않게 한다.
// 전체 화면 스피너와 실패 알림(주소의 오류 표시 → 로그인 화면 토스트)은 3단계에서 만든다.
export default function KakaoCallbackPage() {
  const result = useKakaoCallback();

  if (result.status === 'success') return <Navigate to={paths.entry} replace />;
  if (result.status === 'error') return <Navigate to={paths.login} replace />;
  return <ScreenPlaceholder screenId="ON-00" name="카카오 로그인 확인" />;
}
