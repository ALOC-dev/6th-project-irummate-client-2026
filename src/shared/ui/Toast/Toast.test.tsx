import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Toast } from './Toast';

afterEach(() => vi.useRealTimers());

describe('Toast', () => {
  it('정해진 시간이 지나면 닫기 동작을 전달한다', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast open duration={1000} onDismiss={onDismiss}>저장했어요</Toast>);
    expect(screen.getByRole('status')).toHaveTextContent('저장했어요');
    act(() => vi.advanceTimersByTime(1000));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
