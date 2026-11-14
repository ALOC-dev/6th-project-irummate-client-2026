import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BottomNav } from './BottomNav';

const items = [
  { key: 'home', label: '홈', icon: <span>H</span> },
  { key: 'mate', label: '매이트', icon: <span>M</span> },
] as const;

describe('BottomNav', () => {
  it('활성 탭을 표시하고 선택을 전달한다', async () => {
    const onSelect = vi.fn();
    render(<BottomNav items={items} activeKey="home" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: '홈' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: '매이트' }));
    expect(onSelect).toHaveBeenCalledWith('mate');
  });
});
