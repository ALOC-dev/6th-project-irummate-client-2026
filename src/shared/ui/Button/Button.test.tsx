import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('클릭 동작을 전달한다', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>저장</Button>);
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('로딩 중에는 버튼을 비활성화한다', () => {
    render(<Button loading>저장</Button>);

    const button = screen.getByRole('button', { name: '처리 중' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
