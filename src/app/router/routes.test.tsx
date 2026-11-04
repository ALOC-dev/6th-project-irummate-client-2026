import { screen } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ok } from '@test/msw/handlers/envelope';
import { setSessionScenario, type SessionScenario } from '@test/msw/scenarios/session';
import { server } from '@test/msw/server';
import { renderWithProviders } from '@test/renderWithProviders';

import { paths } from './paths';

const anonymous: SessionScenario = { session: 'anonymous' };
const certified: SessionScenario = { session: 'certified' };
const onboarding = (stage: 'terms' | 'intro' | 'profile' | 'certification'): SessionScenario => ({ session: 'onboarding', stage });

// 화면 18개: [경로, 시나리오, 화면 ID]
const screens: Array<[string, SessionScenario, string]> = [
  [paths.login, anonymous, 'ON-01'],
  [paths.kakaoCallback, anonymous, 'ON-00'],
  [paths.onboarding.terms, onboarding('terms'), 'ON-02'],
  [paths.onboarding.intro, onboarding('intro'), 'ON-03'],
  [paths.onboarding.profile, onboarding('profile'), 'ON-04'],
  [paths.onboarding.certification, onboarding('certification'), 'ON-05'],
  [paths.home, certified, 'HM-01'],
  [paths.match, certified, 'MC-01'],
  [paths.mateProfile('7'), certified, 'MC-02'],
  [paths.matchResult('7'), certified, 'MC-03'],
  [paths.mate, certified, 'MT-01'],
  [paths.chats, certified, 'CH-01'],
  [paths.chatRoom('3'), certified, 'CH-02'],
  [paths.my, certified, 'MY-01'],
  [paths.survey, certified, 'MY-02'],
  [paths.policy('tos'), certified, 'MY-03'],
  [paths.blocked, certified, 'MY-04'],
  [paths.notificationSettings, certified, 'MY-05'],
];

function useAdminSession() {
  server.use(http.get('*/api/auth/status', () => ok({ id: 9, name: '관리자', dormRoom: null, stage: 'admin' })));
}

describe('라우트 골격 (앱)', () => {
  it.each(screens)('%s → %s', async (route, scenario, screenId) => {
    setSessionScenario(scenario);
    renderWithProviders({ route });
    expect(await screen.findByRole('heading', { name: new RegExp(`^${screenId} `) })).toBeInTheDocument();
  });

  it('관리자 홈 → AD-01', async () => {
    useAdminSession();
    renderWithProviders({ route: paths.admin.home });
    expect(await screen.findByRole('heading', { name: /^AD-01 / })).toBeInTheDocument();
  });

  it('하단 탭은 탭 화면에서만 보인다', async () => {
    renderWithProviders({ route: paths.home });
    expect(await screen.findByRole('navigation', { name: '하단 탭' })).toBeInTheDocument();
  });

  it('스택 화면에는 하단 탭이 없다', async () => {
    renderWithProviders({ route: paths.survey });
    await screen.findByRole('heading', { name: /^MY-02 / });
    expect(screen.queryByRole('navigation', { name: '하단 탭' })).not.toBeInTheDocument();
  });
});

describe('라우트 골격 (관리자 웹)', () => {
  it('관리자 화면은 열린다', async () => {
    useAdminSession();
    const { router } = renderWithProviders({ route: paths.entry, target: 'admin-web' });
    expect(await screen.findByRole('heading', { name: /^AD-01 / })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.admin.home);
  });

  it('사용자 화면은 등록되지 않아 로그인으로 간다', async () => {
    const { router } = renderWithProviders({ route: paths.home, target: 'admin-web' });
    expect(await screen.findByRole('heading', { name: /^ON-01 / })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.login);
  });
});
