import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { paths, routePatterns } from '@app/router/paths';

import ChatRoomPage from './ChatRoomPage';

describe('ChatRoomPage', () => {
  it('다른 채팅방으로 이동하면 이전 방의 메시지를 초기화한다', async () => {
    const router = createMemoryRouter(
      [{ path: routePatterns.chatRoom, element: <ChatRoomPage /> }],
      { initialEntries: [paths.chatRoom('room-sae-bom')] },
    );

    render(<RouterProvider router={router} />);
    expect(screen.getByText('안녕하세요! 매칭돼서 반가워요 😊')).toBeInTheDocument();

    await act(() => router.navigate(paths.chatRoom('room-running')));

    expect(screen.getByRole('heading', { name: '한강 러닝 메이트' })).toBeInTheDocument();
    expect(screen.getByText('토요일 오전 9시에 2번 출구에서 만나요!')).toBeInTheDocument();
    expect(screen.queryByText('안녕하세요! 매칭돼서 반가워요 😊')).not.toBeInTheDocument();
  });
});
