import { describe, expect, it } from 'vitest';

import { backActionFor, type BackAction } from './backAction';
import { paths } from './paths';

const back: BackAction = { type: 'history-back' };
const exit: BackAction = { type: 'exit-prompt' };
const toHome: BackAction = { type: 'navigate', to: paths.home };

describe('backActionFor', () => {
  it.each<[string, string, string, boolean, BackAction]>([
    ['기록 있음: 뒤로', paths.chatRoom('3'), '', true, back],
    ['기록 있음: 시트도 뒤로가기로 닫음', paths.mate, '?post=1', true, back],
    ['기록 있음: 홈에서도 뒤로', paths.home, '', true, back],
    ['홈: 종료 확인', paths.home, '', false, exit],
    ['홈 + 시트: 시트만 닫음', paths.home, '?sheet=1', false, { type: 'navigate', to: paths.home }],
    ['다른 탭 루트: 홈으로', paths.match, '', false, toHome],
    ['다른 탭 루트 + 시트: 시트만 닫음', paths.mate, '?post=1', false, { type: 'navigate', to: paths.mate }],
    ['하위 화면: 홈으로', paths.chatRoom('3'), '', false, toHome],
    ['MY 하위 화면: 홈으로', paths.survey, '', false, toHome],
    ['시작 주소: 종료 확인', paths.entry, '', false, exit],
    ['로그인: 종료 확인', paths.login, '', false, exit],
    ['카카오 콜백: 종료 확인', paths.kakaoCallback, '?code=x', false, exit],
    ['가입 단계: 종료 확인', paths.onboarding.profile, '', false, exit],
    ['관리자: 종료 확인', paths.admin.home, '', false, exit],
  ])('%s (%s%s, 기록 %s)', (_name, pathname, search, canGoBack, expected) => {
    expect(backActionFor({ pathname, search, canGoBack })).toEqual(expected);
  });
});
