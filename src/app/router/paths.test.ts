import { describe, expect, it } from 'vitest';

import { paths, tabRoots } from './paths';

describe('paths', () => {
  it.each([
    [paths.mateProfile('7'), '/match/mates/7'],
    [paths.matchResult('7'), '/match/mates/7/result'],
    [paths.matePost('p1'), '/mate?post=p1'],
    [paths.chatRoom('r 1'), '/chats/r%201'],
    [paths.policy('privacy'), '/my/policies/privacy'],
  ])('%s', (actual, expected) => {
    expect(actual).toBe(expected);
  });

  it('카카오 콜백은 1학기 경로를 쓴다', () => {
    expect(paths.kakaoCallback).toBe('/oauth/kakao/callback');
  });

  it('하단 탭 루트는 4개', () => {
    expect(tabRoots).toEqual(['/home', '/match', '/mate', '/my']);
  });
});
