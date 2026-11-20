import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WheelColumn } from './WheelColumn';

const pad = (value: number) => String(value).padStart(2, '0');

describe('WheelColumn', () => {
  it('항목을 누르거나 화살표 키로 고르고, 막힌 항목은 고르지 않는다', () => {
    const onChange = vi.fn();
    render(<WheelColumn label="시" items={[8, 9, 10]} value={9} format={pad} isDisabled={(hour) => hour === 8} onChange={onChange} />);
    expect(screen.getByRole('option', { name: '09' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('option', { name: '10' }));
    expect(onChange).toHaveBeenLastCalledWith(10);

    fireEvent.click(screen.getByRole('option', { name: '08' }));
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('listbox', { name: '시' }), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith(10);
    fireEvent.keyDown(screen.getByRole('listbox', { name: '시' }), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
