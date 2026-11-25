import { describe, expect, it } from 'vitest';

import { deepLinkPath, hostOf } from './deepLinkPath';

const host = 'test.irummate.com';

describe('deepLinkPath', () => {
  it.each<[string, string, string | null, string | null]>([
    ['카카오 콜백', 'https://test.irummate.com/oauth/kakao/callback?code=a&state=b', host, '/oauth/kakao/callback?code=a&state=b'],
    ['해시 포함', 'https://test.irummate.com/mate?post=1#top', host, '/mate?post=1#top'],
    ['다른 도메인', 'https://evil.com/oauth/kakao/callback?code=a', host, null],
    ['비슷한 도메인', 'https://test.irummate.com.evil.com/home', host, null],
    ['http', 'http://test.irummate.com/home', host, null],
    ['다른 scheme', 'irummate://home', host, null],
    ['포트가 다름', 'https://test.irummate.com:8443/home', host, null],
    ['주소 형식 아님', 'not a url', host, null],
    ['받을 도메인이 없음', 'https://test.irummate.com/home', null, null],
  ])('%s', (_name, url, allowedHost, expected) => {
    expect(deepLinkPath(url, allowedHost)).toBe(expected);
  });
});

describe('hostOf', () => {
  it.each<[string, string | null]>([
    ['https://test.irummate.com/oauth/kakao/callback', 'test.irummate.com'],
    ['', null],
    ['not a url', null],
  ])('%s → %s', (url, expected) => {
    expect(hostOf(url)).toBe(expected);
  });
});
