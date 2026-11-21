import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { paths, routePatterns } from '@app/router/paths';

import { NotificationListView } from './NotificationListView';

const now = new Date(2026, 10, 21, 14, 0);
const icons = { back: <svg />, mate: (kind: string) => <svg data-mate-kind={kind} /> };

function renderList() {
  const router = createMemoryRouter([
    { path: paths.notifications, element: <NotificationListView icons={icons} now={now} /> },
    { path: paths.notificationSettings, element: <h1>설정 화면</h1> },
    { path: routePatterns.mateProfile, element: <h1>프로필 화면</h1> },
  ], { initialEntries: [paths.notifications] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('NotificationListView', () => {
  it('오늘·이전으로 나눠 시안의 문구와 시간을 보여준다', () => {
    renderList();
    expect(screen.getByRole('heading', { level: 1, name: '알림' })).toBeInTheDocument();
    const today = screen.getByRole('region', { name: '오늘' });
    expect(within(today).getAllByRole('article')).toHaveLength(2);
    expect(within(today).getByText('매칭 · 1시간 전')).toBeInTheDocument();
    expect(within(today).getAllByText('읽지 않음')).toHaveLength(2);
    const earlier = screen.getByRole('region', { name: '이전' });
    expect(within(earlier).getByText('생활관 공지 · 어제')).toBeInTheDocument();
    expect(within(earlier).queryByText('읽지 않음')).not.toBeInTheDocument();
  });

  it('분류 칩을 누르면 그 분류만 보여준다', async () => {
    renderList();
    const mate = screen.getByRole('button', { name: '매이트' });
    await userEvent.click(mate);
    expect(mate).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByText('모집이 마감됐어요')).toBeInTheDocument();
    expect(screen.queryByText('새 매칭 요청이 왔어요')).not.toBeInTheDocument();
  });

  it('채팅 알림은 두지 않고, 매이트 알림은 모집글 분류 아이콘을 쓴다', () => {
    renderList();
    expect(screen.queryByRole('button', { name: '채팅' })).not.toBeInTheDocument();
    const kinds = [...document.querySelectorAll('[data-mate-kind]')].map((node) => node.getAttribute('data-mate-kind'));
    expect(kinds).toEqual(['OTHER', 'MEAL', 'GROUP_BUY']);
    expect(document.querySelector('[data-brand-icon="office"]')).not.toBeNull();
  });

  it('톱니바퀴는 알림 설정으로, 프로필 보기는 메이트 프로필로 이동한다', async () => {
    const router = renderList();
    await userEvent.click(screen.getByRole('button', { name: '프로필 보기' }));
    expect(router.state.location.pathname).toBe(paths.mateProfile('7'));
    await router.navigate(paths.notifications);
    await userEvent.click(await screen.findByRole('button', { name: '알림 설정' }));
    expect(router.state.location.pathname).toBe(paths.notificationSettings);
  });
});
