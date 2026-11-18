import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { paths, routePatterns } from '@app/router/paths';

import { ChatRoomView } from './ChatRoomView';

function renderRoom(roomId: string) {
  return render(
    <MemoryRouter initialEntries={[paths.chatRoom(roomId)]}>
      <Routes><Route path={routePatterns.chatRoom} element={<ChatRoomView today={new Date(2026, 10, 18)} />} /></Routes>
    </MemoryRouter>,
  );
}

describe('ChatRoomView', () => {
  afterEach(() => vi.useRealTimers());

  it('방 정보와 메시지를 초안 구성으로 보여준다', () => {
    renderRoom('room-jia');
    expect(screen.getByRole('heading', { name: '지아' })).toBeInTheDocument();
    // 채팅 상대 유형 태그(매칭·매이트 등)는 보여 주지 않는다.
    expect(screen.queryByText('매칭')).not.toBeInTheDocument();
    expect(screen.getByText('매칭 성사 · 생활 궁합 88%')).toBeInTheDocument();
    expect(screen.getByText('11월 18일 수요일')).toBeInTheDocument();
    expect(screen.getByText('안녕하세요! 매칭돼서 반가워요')).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: '지아' })).toHaveLength(2);
  });

  it('단체방은 보낸 사람 이름을 보여준다', () => {
    renderRoom('room-dinner');
    expect(screen.getAllByText('민지')).toHaveLength(2);
    expect(screen.getByText('도윤')).toBeInTheDocument();
  });

  it('입력한 메시지를 대화에 추가한다', async () => {
    const user = userEvent.setup();
    renderRoom('room-jia');
    await user.type(screen.getByLabelText('메시지'), '내일 이야기해요');
    await user.click(screen.getByRole('button', { name: '메시지 보내기' }));
    expect(screen.getByText('내일 이야기해요')).toBeInTheDocument();
    expect(screen.getByLabelText('메시지')).toHaveValue('');
  });

  it('이룸봇은 잠시 뒤 답한다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderRoom('bot');
    await user.type(screen.getByLabelText('메시지'), '신청 마감 언제예요?{Enter}');
    expect(screen.queryByText(/10월 6일 23:59까지예요. 매칭이/)).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(700); });
    expect(screen.getByText(/10월 6일 23:59까지예요. 매칭이/)).toBeInTheDocument();
  });

  it('없는 채팅방은 안내하고 임의의 방을 열지 않는다', () => {
    renderRoom('missing-room');
    expect(screen.getByRole('heading', { name: '채팅방을 찾을 수 없어요' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '채팅 목록으로' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '지아' })).not.toBeInTheDocument();
  });
});
