import { Outlet } from 'react-router';

// 가입 흐름 틀. 배경·뒤로가기·safe-area는 나중에 더한다.
export function OnboardingLayout() {
  return <Outlet />;
}
