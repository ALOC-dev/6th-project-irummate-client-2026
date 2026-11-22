import { describe, expect, it } from 'vitest';

import type { OnboardingStage } from '@features/auth';

import { paths } from './paths';
import { canOpenOnboardingPath, canReturnTo, entryPathFor } from './stageEntry';

const { terms, intro, profile, certification } = paths.onboarding;

describe('canOpenOnboardingPath', () => {
  it.each<[OnboardingStage, string, boolean]>([
    ['terms', terms, true],
    ['terms', intro, false],
    ['intro', intro, true],
    ['intro', terms, false],
    ['intro', profile, false],
    ['profile', profile, true],
    ['profile', intro, true], // 소개 다시 보기
    ['profile', terms, false],
    ['profile', certification, false],
    ['certification', certification, true],
    ['certification', profile, false],
    ['pending', certification, false],
    ['certified', terms, false],
    ['admin', terms, false],
    ['login', terms, false],
  ])('%s 단계에서 %s → %s', (stage, path, expected) => {
    expect(canOpenOnboardingPath(stage, path)).toBe(expected);
  });
});

describe('canReturnTo', () => {
  it.each<[OnboardingStage, string, boolean]>([
    ['certified', paths.match, true],
    ['certified', paths.chatRoom('3'), true],
    ['pending', paths.mate, true],
    ['certified', paths.admin.home, false],
    ['admin', paths.admin.home, true],
    ['admin', '/admin/users', true],
    ['admin', '/administrator', false],
    ['admin', paths.home, false],
    ['terms', paths.match, false],
    ['certification', paths.match, false],
  ])('%s 단계는 %s로 돌아감 → %s', (stage, path, expected) => {
    expect(canReturnTo(stage, path)).toBe(expected);
  });
});

describe('entryPathFor', () => {
  it('관리자 웹에서 일반 사용자는 로그인으로', () => {
    expect(entryPathFor('certified', 'admin-web')).toBe(paths.login);
    expect(entryPathFor('admin', 'admin-web')).toBe(paths.admin.home);
  });
});
