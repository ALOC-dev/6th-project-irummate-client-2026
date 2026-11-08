import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('아이콘에 접근 가능한 이름을 제공한다', () => {
    render(<IconButton label="알림 열기">🔔</IconButton>);

    expect(screen.getByRole('button', { name: '알림 열기' })).toBeInTheDocument();
  });

  it('danger 상태에 별도 hover 의미 토큰을 사용한다', () => {
    render(<IconButton label="삭제" variant="danger">×</IconButton>);

    expect(screen.getByRole('button', { name: '삭제' })).toHaveClass('hover:bg-danger-soft-hover');
  });
});
