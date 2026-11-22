import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@app/router/paths';
import { setSessionScenario } from '@test/msw/scenarios/session';
import { renderWithProviders } from '@test/renderWithProviders';

const TITLE = '기숙사 인증을 확인하고 있어요';

// [경로, 화면 ID, 기능, 뒤로 버튼]
const screens: Array<[string, string, string, boolean]> = [
  [paths.match, 'MC-01', '매칭', false],
  [paths.mateProfile('7'), 'MC-02', '매칭', true],
  [paths.matchResult('7'), 'MC-03', '매칭', true],
  [paths.chats, 'CH-01', '채팅', true],
  [paths.chatRoom('room-jia'), 'CH-02', '채팅', true],
];

describe('인증 심사 중 안내', () => {
  afterEach(() => vi.useRealTimers());

  it.each(screens)('심사 중이면 %s(%s)에 안내를 띄운다', async (route, screenId, feature, back) => {
    setSessionScenario({ session: 'pending' });
    renderWithProviders({ route });
    expect(await screen.findByRole('heading', { name: new RegExp(`^${screenId} `) })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: feature, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: TITLE })).toBeInTheDocument();
    expect(screen.getByText(`인증이 끝나면 바로 ${feature}을 시작할 수 있어요.`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '뒤로' }) !== null).toBe(back);
  });

  it('요청을 보냈다는 표시 뒤에 확인 중 표시로 넘어간다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setSessionScenario({ session: 'pending' });
    renderWithProviders({ route: paths.match });
    const status = await screen.findByRole('status');
    expect(screen.getByText('인증 요청을 보냈어요').closest('p')).toHaveAttribute('aria-hidden', 'false');
    act(() => { vi.advanceTimersByTime(1200); });
    expect(screen.getByText('운영팀이 확인하고 있어요').closest('p')).toHaveAttribute('aria-hidden', 'false');
    expect(status).toHaveTextContent('운영팀이 확인하고 있어요');
  });

  it('인증을 마쳤으면 안내 없이 원래 화면을 보여준다', async () => {
    setSessionScenario({ session: 'certified' });
    renderWithProviders({ route: paths.chats });
    expect(await screen.findByRole('heading', { name: /^CH-01 / })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: TITLE })).not.toBeInTheDocument();
  });

  it('홈으로 버튼은 홈으로 이동한다', async () => {
    setSessionScenario({ session: 'pending' });
    const { router } = renderWithProviders({ route: paths.match });
    await userEvent.click(await screen.findByRole('button', { name: '홈으로' }));
    expect(await screen.findByRole('heading', { name: /^HM-01 / })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.home);
  });

  it('매이트 둘러보기 버튼은 매이트 게시판으로 이동한다', async () => {
    setSessionScenario({ session: 'pending' });
    const { router } = renderWithProviders({ route: paths.match });
    await userEvent.click(await screen.findByRole('button', { name: '매이트 둘러보기' }));
    await vi.waitFor(() => expect(router.state.location.pathname).toBe(paths.mate));
  });

  it('주소로 바로 연 채팅에서 뒤로 가면 홈으로 간다', async () => {
    setSessionScenario({ session: 'pending' });
    const { router } = renderWithProviders({ route: paths.chats });
    await userEvent.click(await screen.findByRole('button', { name: '뒤로' }));
    await vi.waitFor(() => expect(router.state.location.pathname).toBe(paths.home));
  });
});
