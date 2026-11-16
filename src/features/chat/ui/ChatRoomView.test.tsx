import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routePatterns } from '@app/router/paths';

import { ChatRoomView } from './ChatRoomView';

describe('ChatRoomView', () => {
  it('방에 맞는 목 메시지를 보여준다', () => {
    render(
      <MemoryRouter initialEntries={['/chats/room-sae-bom']}>
        <Routes><Route path={routePatterns.chatRoom} element={<ChatRoomView />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: '새봄' })).toBeInTheDocument();
    expect(screen.getByText('안녕하세요! 매칭돼서 반가워요 😊')).toBeInTheDocument();
  });

  it('입력한 목 메시지를 대화에 추가한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/chats/room-sae-bom']}>
        <Routes><Route path={routePatterns.chatRoom} element={<ChatRoomView />} /></Routes>
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText('메시지'), '내일 이야기해요');
    await user.click(screen.getByRole('button', { name: '메시지 보내기' }));
    expect(screen.getByText('내일 이야기해요')).toBeInTheDocument();
    expect(screen.getByLabelText('메시지')).toHaveValue('');
  });

  it('없는 채팅방은 안내하고 임의의 방을 열지 않는다', () => {
    render(
      <MemoryRouter initialEntries={['/chats/missing-room']}>
        <Routes><Route path={routePatterns.chatRoom} element={<ChatRoomView />} /></Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '채팅방을 찾을 수 없어요' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '채팅 목록으로' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '새봄' })).not.toBeInTheDocument();
  });
});
