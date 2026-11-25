import { paths, tabRoots } from './paths';

// Android 뒤로가기 버튼을 눌렀을 때 할 일. 앞 화면 기록이 없을 때의 규칙을 한 곳에 둔다.
export type BackAction =
  | { type: 'history-back' }
  | { type: 'navigate'; to: string }
  | { type: 'exit-prompt' };

export interface BackContext {
  pathname: string;
  search: string;
  // 이 앱 안에서 뒤로 갈 기록이 있는지
  canGoBack: boolean;
}

// 여기서 뒤로가기는 앱 종료 확인이다. 홈이나 그 앞 단계(로그인·가입·관리자) 화면에는 돌아갈 화면이 없다.
function isExitScreen(pathname: string): boolean {
  return (
    pathname === paths.home ||
    pathname === paths.entry ||
    pathname === paths.login ||
    pathname === paths.kakaoCallback ||
    pathname.startsWith('/onboarding/') ||
    pathname === paths.admin.home ||
    pathname.startsWith(`${paths.admin.home}/`)
  );
}

export function backActionFor({ pathname, search, canGoBack }: BackContext): BackAction {
  // 기록이 있으면 브라우저 뒤로가기. 시트·오버레이(URL 쿼리)도 이것으로 닫힌다.
  if (canGoBack) return { type: 'history-back' };
  // 알림 등으로 시트가 열린 채 앱이 시작된 경우: 시트만 닫는다.
  if (search && (tabRoots as readonly string[]).includes(pathname)) return { type: 'navigate', to: pathname };
  if (isExitScreen(pathname)) return { type: 'exit-prompt' };
  // 다른 탭 루트, 딥링크로 바로 연 하위 화면: 홈으로
  return { type: 'navigate', to: paths.home };
}
