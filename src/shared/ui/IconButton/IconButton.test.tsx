import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('아이콘에 접근 가능한 이름을 제공한다', () => {
    render(<IconButton label="알림 열기">🔔</IconButton>);

    expect(screen.getByRole('button', { name: '알림 열기' })).toBeInTheDocument();
  });
});
