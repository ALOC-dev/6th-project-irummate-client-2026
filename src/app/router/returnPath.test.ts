import { describe, expect, it } from 'vitest';

import { isInternalPath, returnPath } from './returnPath';

describe('isInternalPath', () => {
  it.each<[string, boolean]>([
    ['/match', true],
    ['/chats/3?tab=1#bottom', true],
    ['//evil.example.com', false],
    ['/\\evil.example.com', false],
    ['https://evil.example.com', false],
    ['javascript:alert(1)', false],
    ['match', false],
    ['', false],
  ])('%s → %s', (value, expected) => {
    expect(isInternalPath(value)).toBe(expected);
  });
});

describe('returnPath', () => {
  it('앱 안 경로만 기억하고, 지우면 없다', () => {
    returnPath.remember('/match');
    expect(returnPath.peek()).toBe('/match');
    returnPath.clear();
    expect(returnPath.peek()).toBeNull();
  });

  it('다른 사이트 주소는 기억하지 않는다', () => {
    returnPath.clear();
    returnPath.remember('//evil.example.com');
    expect(returnPath.peek()).toBeNull();
  });

  it('저장소에 직접 들어간 바깥 주소도 읽지 않는다', () => {
    window.sessionStorage.setItem('irummate.returnPath', 'https://evil.example.com');
    expect(returnPath.peek()).toBeNull();
  });
});
