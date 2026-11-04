import { Outlet } from 'react-router';

// 하단 탭 없는 화면 틀. 뒤로가기 앱바는 나중에 더한다.
export function StackLayout() {
  return <Outlet />;
}
