import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { DormHomeView } from './DormHomeView';

describe('DormHomeView', () => {
  it('초안의 생활관 정보와 기숙사 공지를 보여준다', () => {
    render(<MemoryRouter><DormHomeView /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '이룸매이트' })).toBeInTheDocument();
    expect(screen.getByText('생활관 · 408호')).toBeInTheDocument();
    expect(screen.getAllByText('2학기 룸메이트 신청 마감 안내')).toHaveLength(2);
    expect(screen.getByText('택배 보관함 정리')).toBeInTheDocument();
  });

  it('날짜를 선택하면 해당 일정을 보여준다', async () => {
    render(<MemoryRouter><DormHomeView /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: '11월 16일' }));
    expect(screen.getByText('공용 세탁실 점검')).toBeInTheDocument();
    expect(screen.queryByText('택배 보관함 정리')).not.toBeInTheDocument();
  });
});
