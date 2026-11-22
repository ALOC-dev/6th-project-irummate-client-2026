import { KakaoLoginButton, useKakaoLogin } from '@features/auth';

import { ScreenPlaceholder } from '../ScreenPlaceholder';

// 2단계: 로그인 흐름 확인용으로 카카오 버튼만 연결한다. v1.6 화면(로고·문구·캐릭터)과 실패 알림은 3단계에서 만든다.
export default function LoginPage() {
  const { login, isStarting } = useKakaoLogin();

  return (
    <>
      <ScreenPlaceholder screenId="ON-01" name="로그인" />
      <KakaoLoginButton
        loading={isStarting}
        onClick={() => {
          // 시작 실패(외부 브라우저를 열지 못함 등)의 알림은 3단계 화면에서 붙인다.
          login().catch(() => {});
        }}
      />
    </>
  );
}
