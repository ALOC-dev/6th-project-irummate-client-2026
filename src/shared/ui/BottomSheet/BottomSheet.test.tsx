import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('제목과 내용을 보여주고 닫기 동작을 전달한다', async () => {
    const onClose = vi.fn();
    render(<BottomSheet open title="모집 상세" onClose={onClose}>내용</BottomSheet>);
    expect(screen.getByRole('dialog', { name: '모집 상세' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
