import { useLogout } from '@features/auth';
import { Button } from '@shared/ui';

import { ScreenPlaceholder } from '../ScreenPlaceholder';

// 2단계: 로그인 → 재발급 → 로그아웃 확인용으로 로그아웃 버튼만 연결한다.
// 학생증 카드·메뉴·회원탈퇴는 3단계에서 만든다. 로그아웃 후 화면 이동은 가드가 한다(비로그인 → 로그인 화면).
export default function MyPage() {
  const { logout, isPending } = useLogout();

  return (
    <>
      <ScreenPlaceholder screenId="MY-01" name="MY" />
      <Button variant="secondary" loading={isPending} loadingLabel="로그아웃 중" onClick={() => void logout()}>
        로그아웃
      </Button>
    </>
  );
}
