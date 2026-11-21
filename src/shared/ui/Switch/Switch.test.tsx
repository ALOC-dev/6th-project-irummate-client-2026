import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
  it('상태를 알리고 누르면 반대 값을 전달한다', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="채팅" checked onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole('switch', { name: '채팅' });
    expect(control).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('꺼져 있으면 누르지 못한다', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="야간 혜택 알림" checked={false} disabled onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole('switch', { name: '야간 혜택 알림' });
    expect(control).toBeDisabled();
    await userEvent.click(control);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
