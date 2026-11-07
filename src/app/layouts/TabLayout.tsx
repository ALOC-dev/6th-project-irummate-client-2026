import { NavLink, Outlet } from 'react-router';

import { paths, type TabRoot } from '../router/paths';

// 임시 하단 탭. uukdo의 BottomNav와 헤더 버튼(ChatEntryButton·NotificationBell)이 오면 바꾼다.
const TAB_LABELS: Record<TabRoot, string> = {
  [paths.home]: '홈',
  [paths.match]: '매칭',
  [paths.mate]: '매이트',
  [paths.my]: 'MY',
};

export function TabLayout() {
  return (
    <>
      <Outlet />
      <nav aria-label="하단 탭">
        {(Object.keys(TAB_LABELS) as TabRoot[]).map((path) => (
          <NavLink key={path} to={path}>
            {TAB_LABELS[path]}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
