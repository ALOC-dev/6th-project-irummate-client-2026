import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { setSessionScenario, type SessionScenario } from '@test/msw/scenarios/session';
import { renderWithProviders } from '@test/renderWithProviders';

import { paths } from '../paths';

// [설명, 시나리오, 출발 경로, 도착 경로, 도착 화면 ID]
const cases: Array<[string, SessionScenario, string, string, string]> = [
  ['미로그인 → 로그인', { session: 'anonymous' }, paths.entry, paths.login, 'ON-01'],
  ['미로그인이 탭 화면을 열면 → 로그인', { session: 'anonymous' }, paths.match, paths.login, 'ON-01'],
  ['가입 중(terms) → 약관', { session: 'onboarding', stage: 'terms' }, paths.entry, paths.onboarding.terms, 'ON-02'],
  ['가입 중(intro) → 소개', { session: 'onboarding', stage: 'intro' }, paths.entry, paths.onboarding.intro, 'ON-03'],
  ['가입 중(profile) → 기본 정보', { session: 'onboarding', stage: 'profile' }, paths.entry, paths.onboarding.profile, 'ON-04'],
  ['가입 중(certification) → 기숙사 인증', { session: 'onboarding', stage: 'certification' }, paths.entry, paths.onboarding.certification, 'ON-05'],
  ['가입 중에 다음 단계를 건너뛰면 → 현재 단계', { session: 'onboarding', stage: 'terms' }, paths.onboarding.certification, paths.onboarding.terms, 'ON-02'],
  ['가입 중에 홈을 열면 → 현재 단계', { session: 'onboarding', stage: 'profile' }, paths.home, paths.onboarding.profile, 'ON-04'],
  ['인증 완료 → 홈', { session: 'certified' }, paths.entry, paths.home, 'HM-01'],
  ['인증 완료가 가입 화면을 열면 → 홈', { session: 'certified' }, paths.onboarding.terms, paths.home, 'HM-01'],
  ['인증 완료가 관리자 화면을 열면 → 홈', { session: 'certified' }, paths.admin.home, paths.home, 'HM-01'],
  ['없는 경로 → 첫 화면', { session: 'certified' }, '/nowhere', paths.home, 'HM-01'],
];

describe('가드', () => {
  it.each(cases)('%s', async (_name, scenario, from, to, screenId) => {
    setSessionScenario(scenario);
    const { router } = renderWithProviders({ route: from });
    expect(await screen.findByRole('heading', { name: new RegExp(`^${screenId} `) })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(to);
  });
});
