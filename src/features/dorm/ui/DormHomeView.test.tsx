import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { DormHomeView } from './DormHomeView';

describe('DormHomeView', () => {
  it('생활관 공지와 오늘 일정을 보여준다', () => {
    render(<MemoryRouter><DormHomeView /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '지원님' })).toBeInTheDocument();
    expect(screen.getByText('동절기 생활관 난방 운영 안내')).toBeInTheDocument();
    expect(screen.getByText('택배 보관함 정리')).toBeInTheDocument();
  });

  it('날짜를 선택하면 해당 일정을 보여준다', async () => {
    render(<MemoryRouter><DormHomeView /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: '11월 16일' }));
    expect(screen.getByText('공용 세탁실 점검')).toBeInTheDocument();
    expect(screen.queryByText('택배 보관함 정리')).not.toBeInTheDocument();
  });
});
