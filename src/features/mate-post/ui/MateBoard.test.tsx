import { fireEvent, render, screen } from '@testing-library/react';
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
    renderBoard('/mate?post=1');
    expect(screen.getByRole('dialog', { name: '밥' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('작성 오버레이에서 목 모집 글을 추가한다', async () => {
    const user = userEvent.setup();
    renderBoard();
    await user.click(screen.getByRole('button', { name: /모집하기/ }));
    await user.type(screen.getByLabelText('모집 제목'), '같이 산책해요');
    await user.type(screen.getByLabelText('모집 내용'), '저녁에 가볍게 걸어요.');
    await user.type(screen.getByLabelText('만날 장소'), '생활관 로비');
    fireEvent.change(screen.getByLabelText('활동 일시'), { target: { value: '2099-11-16T20:00' } });
    fireEvent.change(screen.getByLabelText('모집 마감 일시'), { target: { value: '2099-11-16T19:00' } });
    await user.click(screen.getByRole('button', { name: '모집 글 올리기' }));
    await user.click(screen.getByRole('button', { name: /같이 산책해요/ }));
    expect(screen.getByRole('dialog', { name: '밥' })).toBeInTheDocument();
    expect(screen.getByText('저녁에 가볍게 걸어요.')).toBeInTheDocument();
  });

  it('작성을 취소하면 입력한 초안을 초기화한다', async () => {
    const user = userEvent.setup();
    renderBoard();
    await user.click(screen.getByRole('button', { name: /모집하기/ }));
    await user.type(screen.getByLabelText('모집 제목'), '남으면 안 되는 제목');
    await user.click(screen.getByRole('button', { name: '취소' }));
    await user.click(screen.getByRole('button', { name: /모집하기/ }));
    expect(screen.getByLabelText('모집 제목')).toHaveValue('');
  });
});
