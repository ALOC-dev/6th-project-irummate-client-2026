import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ChatListView } from './ChatListView';

describe('ChatListView', () => {
  it('목 채팅 목록과 읽지 않은 수를 보여준다', () => {
    render(<MemoryRouter><ChatListView /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '채팅' })).toBeInTheDocument();
    expect(screen.getByText('새봄')).toBeInTheDocument();
    expect(screen.getByText('한강 러닝 메이트')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('유형 필터로 목록을 좁힌다', async () => {
    render(<MemoryRouter><ChatListView /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: '운영' }));
    expect(screen.getByText('이룸메이트 운영팀')).toBeInTheDocument();
    expect(screen.queryByText('새봄')).not.toBeInTheDocument();
  });
});
