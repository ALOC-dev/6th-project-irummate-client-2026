import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@app/router/paths';

import { DormHomeView } from './DormHomeView';

const today = new Date(2026, 10, 17);

function renderHome(roomLabel?: string) {
  return render(<MemoryRouter><DormHomeView today={today} roomLabel={roomLabel} /></MemoryRouter>);
}

describe('DormHomeView', () => {
  afterEach(() => vi.useRealTimers());

  it('초안 순서대로 헤더·호실·최신 공지·공지 목록·일정을 보여준다', () => {
    renderHome('512호');
    expect(screen.getByRole('img', { name: '이룸매이트' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '채팅' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
    expect(screen.getByText('생활관 · 512호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^최신 공지: 2학기 룸메이트 신청 마감 안내/ })).toBeInTheDocument();
    const notices = screen.getByRole('region', { name: '기숙사 공지' });
    expect(within(notices).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByRole('heading', { name: '기숙사 일정' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '2026년 11월' })).toBeInTheDocument();
  });

  it('호실을 모르면 호실 없이 생활관만 보여준다', () => {
    renderHome();
    expect(screen.getByText('생활관')).toBeInTheDocument();
    expect(screen.queryByText(/생활관 ·/)).not.toBeInTheDocument();
  });

  it('오늘 일정이 없으면 다음 일정을 안내한다', () => {
    renderHome();
    expect(screen.getByText('11월 17일 · 오늘')).toBeInTheDocument();
    expect(screen.getByText('일정이 없어요 · 다음 일정: 11/20 동계 잔류 신청 시작')).toBeInTheDocument();
  });

  it('날짜를 고르면 그날 일정을 보여준다', async () => {
    renderHome();
    await userEvent.click(screen.getByRole('button', { name: '11월 20일, 일정 1개' }));
    expect(screen.getByText('11월 20일')).toBeInTheDocument();
    expect(screen.getByText('동계 잔류 신청 시작')).toBeInTheDocument();
    expect(screen.getByText('~12/4 · 앱에서 신청')).toBeInTheDocument();
  });

  it('달을 옮겨도 고른 날짜는 그대로다', async () => {
    renderHome();
    await userEvent.click(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByRole('heading', { name: '2026년 10월' })).toBeInTheDocument();
    expect(screen.getByText('11월 17일 · 오늘')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '10월 30일, 일정 1개' }));
    expect(screen.getByText('가을 야식 파티')).toBeInTheDocument();
  });

  it('새로고침하면 회전 후 완료 안내를 띄운다', async () => {
    vi.useFakeTimers();
    renderHome();
    const refresh = screen.getByRole('button', { name: '공지 새로고침' });
    act(() => refresh.click());
    expect(refresh).toHaveAttribute('aria-busy', 'true');
    act(() => { vi.advanceTimersByTime(1200); });
    expect(refresh).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('최신 공지를 불러왔어요');
  });

  it('공지를 누르면 원문 이동 안내를 띄운다', async () => {
    renderHome();
    await userEvent.click(screen.getByRole('button', { name: /^최신 공지:/ }));
    expect(screen.getByRole('status')).toHaveTextContent('원문 페이지로 이동해요');
  });

  it('알림 버튼은 알림 목록으로 이동한다', async () => {
    const router = createMemoryRouter([
      { path: paths.home, element: <DormHomeView today={today} /> },
      { path: paths.notifications, element: <h1>알림 목록</h1> },
    ], { initialEntries: [paths.home] });
    render(<RouterProvider router={router} />);
    await userEvent.click(screen.getByRole('button', { name: '알림' }));
    expect(router.state.location.pathname).toBe(paths.notifications);
  });
});
