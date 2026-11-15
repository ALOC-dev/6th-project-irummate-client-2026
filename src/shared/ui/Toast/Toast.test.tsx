import { act, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
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

  it('부모가 다시 그려져도 닫기 타이머를 다시 시작하지 않는다', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    function RerenderingParent() {
      const [open, setOpen] = useState(true);
      const [, setTick] = useState(0);
      useEffect(() => {
        const timer = window.setInterval(() => setTick((value) => value + 1), 600);
        return () => window.clearInterval(timer);
      }, []);
      return <Toast open={open} duration={1000} onDismiss={() => { setOpen(false); onDismiss(); }}>저장했어요</Toast>;
    }

    render(<RerenderingParent />);
    for (let index = 0; index < 5; index += 1) {
      act(() => vi.advanceTimersByTime(600));
    }

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
