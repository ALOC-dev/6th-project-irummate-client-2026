export interface StatusBarOptions {
  style: 'light' | 'dark';
  overlay?: boolean;
}

// 상태바 글자색·화면 겹침 설정(앱 구현은 나중에 한다). 웹은 아무것도 하지 않는다.
export const statusBar = {
  async configure(_options: StatusBarOptions): Promise<void> {},
};
