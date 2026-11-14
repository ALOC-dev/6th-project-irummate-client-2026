import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FilterChip } from './FilterChip';

describe('FilterChip', () => {
  it('선택 상태와 클릭을 전달한다', async () => {
    const onClick = vi.fn();
    render(<FilterChip selected onClick={onClick}>밥</FilterChip>);
    const chip = screen.getByRole('button', { name: '밥' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
