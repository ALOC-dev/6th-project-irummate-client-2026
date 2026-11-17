import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ChatListView } from './ChatListView';

function renderList() {
  return render(<MemoryRouter><ChatListView /></MemoryRouter>);
}

describe('ChatListView', () => {
  it('고정한 챗봇을 맨 위에, 나머지는 미리보기·안 읽은 수와 함께 보여준다', () => {
    renderList();
    expect(screen.getByRole('heading', { name: '채팅' })).toBeInTheDocument();
    const rooms = screen.getAllByRole('listitem');
    expect(rooms).toHaveLength(7);
    expect(within(rooms[0]!).getByText('이룸봇')).toBeInTheDocument();
    const jia = screen.getByRole('button', { name: '매칭 채팅 지아, 안 읽은 메시지 2개' });
    expect(within(jia).getByText('혹시 입사 전에 한 번 만나볼래요?')).toBeInTheDocument();
    expect(screen.getByText('민지: 6시에 로비에서 봬요!')).toBeInTheDocument();
  });

  it('유형 필터로 목록을 좁힌다', async () => {
    renderList();
    await userEvent.click(screen.getByRole('button', { name: '운영' }));
    expect(screen.getByRole('button', { name: '운영' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('생활관 행정실')).toBeInTheDocument();
    expect(screen.queryByText('지아')).not.toBeInTheDocument();
  });
});
