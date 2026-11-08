import { matchPath } from 'react-router';
import { describe, expect, it } from 'vitest';

import { paths, routePatterns, tabRoots } from './paths';

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

  // 라우트 패턴과 이동 함수가 같은 주소 모양과 파라미터 이름을 쓰는지 확인한다.
  it.each([
    [routePatterns.mateProfile, paths.mateProfile('7'), { mateId: '7' }],
    [routePatterns.matchResult, paths.matchResult('7'), { mateId: '7' }],
    [routePatterns.chatRoom, paths.chatRoom('3'), { roomId: '3' }],
    [routePatterns.policy, paths.policy('tos'), { policyKey: 'tos' }],
  ])('%s 패턴은 %s 주소와 맞는다', (pattern, url, params) => {
    expect(matchPath(pattern, url)?.params).toEqual(params);
  });

  it('카카오 콜백은 1학기 경로를 쓴다', () => {
    expect(paths.kakaoCallback).toBe('/oauth/kakao/callback');
  });

  it('하단 탭 루트는 4개', () => {
    expect(tabRoots).toEqual(['/home', '/match', '/mate', '/my']);
  });
});
