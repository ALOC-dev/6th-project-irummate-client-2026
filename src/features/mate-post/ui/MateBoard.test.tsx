import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { MateBoard } from './MateBoard';

function renderBoard(initialEntry = '/mate') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <MateBoard />
    </MemoryRouter>,
  );
}

describe('MateBoard', () => {
  it('목 모집 글과 필터를 보여준다', () => {
    renderBoard();
    expect(screen.getByRole('heading', { name: '매이트' })).toBeInTheDocument();
    expect(screen.getByText('오늘 저녁 학식 같이 드실 분 구해요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '밥' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('게시글 쿼리로 상세 시트를 열고 닫는다', async () => {
    renderBoard('/mate?post=meal-1');
    expect(screen.getByRole('dialog', { name: '밥' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('작성 오버레이에서 목 모집 글을 추가한다', async () => {
    const user = userEvent.setup();
    renderBoard();
    await user.click(screen.getByRole('button', { name: /모집하기/ }));
    await user.type(screen.getByLabelText('모집 제목'), '같이 산책해요');
    await user.type(screen.getByLabelText('만날 장소'), '생활관 로비');
    await user.type(screen.getByLabelText('만날 시간'), '내일 오후 8시');
    await user.click(screen.getByRole('button', { name: '모집 글 올리기' }));
    expect(screen.getByText('같이 산책해요')).toBeInTheDocument();
  });
});
