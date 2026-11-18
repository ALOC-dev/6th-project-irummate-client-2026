import { render, screen, within } from '@testing-library/react';
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

type User = ReturnType<typeof userEvent.setup>;

// 한 글자씩 치는 user.type은 느려서 전체 테스트에서 시간 초과가 나므로, 눌러서 붙여 넣는다.
async function fill(user: User, label: string, text: string) {
  await user.click(screen.getByLabelText(label));
  await user.paste(text);
}

async function pickDate(user: User, field: string, day: number) {
  await user.click(screen.getByRole('button', { name: new RegExp(`^${field}`) }));
  const panel = screen.getByRole('group', { name: `${field} 고르기` });
  await user.click(within(panel).getByRole('button', { name: '다음 달' }));
  await user.click(within(panel).getByRole('button', { name: new RegExp(`월 ${day}일$`) }));
}

describe('MateBoard', () => {
  it('초안 구성대로 헤더·카테고리·정렬·모집 글을 보여준다', () => {
    renderBoard();
    expect(screen.getByRole('heading', { name: '매이트' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '채팅' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '밥' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('tab', { name: '최신순' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('모집 글 5개')).toBeInTheDocument();
    expect(screen.queryByText('휴지 30롤 공구 (마감)')).not.toBeInTheDocument();
    const water = screen.getByRole('button', { name: '공동구매 모집: 생수 2L 24병 나눠 사요' });
    expect(within(water).getByText('1인 3,200원')).toBeInTheDocument();
    expect(within(water).getByText('5/6명')).toBeInTheDocument();
  });

  it('북마크하면 즐겨찾기만 보기에 남는다', async () => {
    const user = userEvent.setup();
    renderBoard();
    await user.click(screen.getByRole('button', { name: '즐겨찾기에 저장: 주말 한강 러닝 크루 모집' }));
    expect(screen.getByRole('status')).toHaveTextContent('즐겨찾기에 저장했어요');
    await user.click(screen.getByRole('button', { name: '즐겨찾기만 보기' }));
    expect(screen.getByText('저장한 글 1개')).toBeInTheDocument();
    expect(screen.getByText('주말 한강 러닝 크루 모집')).toBeInTheDocument();
  });

  it('저장한 글이 없으면 안내한다', async () => {
    renderBoard();
    await userEvent.click(screen.getByRole('button', { name: '즐겨찾기만 보기' }));
    expect(screen.getByText('저장한 모집 글이 없어요')).toBeInTheDocument();
  });

  it('게시글 쿼리로 상세 시트를 열고 참여한다', async () => {
    const user = userEvent.setup();
    renderBoard('/mate?post=1');
    const sheet = screen.getByRole('dialog', { name: '오늘 저녁 학식 같이 드실 분' });
    expect(within(sheet).getByText('생활관 1층 로비')).toBeInTheDocument();
    expect(within(sheet).getByText('2 / 4명')).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '참여하기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('참여했어요! 단체 채팅방이 열렸어요');
    expect(screen.getByText('참여 중')).toBeInTheDocument();
  });

  it('작성 오버레이에서 목 모집 글을 추가한다', async () => {
    const user = userEvent.setup();
    renderBoard();
    await user.click(screen.getByRole('button', { name: '모집하기' }));
    expect(screen.getByRole('dialog', { name: '모집 글 작성' })).toBeInTheDocument();
    await fill(user, '모집 제목', '같이 산책해요');
    await fill(user, '모집 내용', '저녁에 가볍게 걸어요.');
    await fill(user, '만날 장소', '생활관 로비');
    // 날짜만 고르면 기본 시각(다음 정시)이 들어간다. 날짜에 상관없이 통과하도록 다음 달에서 고르고,
    // 마감(14일)이 활동(15일)보다 빠르도록 한다.
    await pickDate(user, '활동 일시', 15);
    await pickDate(user, '모집 마감 일시', 14);
    expect(screen.getByRole('button', { name: /^활동 일시 .*\d{2}:\d{2}$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^모집 마감 일시 .*\d{2}:\d{2}$/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '모집 글 올리기' }));
    expect(screen.getByRole('status')).toHaveTextContent('모집 글을 올렸어요');
    await user.click(screen.getByRole('button', { name: '밥 모집: 같이 산책해요' }));
    expect(screen.getByRole('dialog', { name: '같이 산책해요' })).toBeInTheDocument();
  });

  it('작성을 닫으면 입력한 초안을 초기화한다', async () => {
    const user = userEvent.setup();
    renderBoard();
    await user.click(screen.getByRole('button', { name: '모집하기' }));
    await fill(user, '모집 제목', '남으면 안 되는 제목');
    await user.click(screen.getByRole('button', { name: '닫기' }));
    await user.click(screen.getByRole('button', { name: '모집하기' }));
    expect(screen.getByLabelText('모집 제목')).toHaveValue('');
  });
});
