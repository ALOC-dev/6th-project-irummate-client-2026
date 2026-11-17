import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MarqueeText } from './MarqueeText';

describe('MarqueeText', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('한 줄에 들어가면 글자를 한 번만 보여 주고 움직이지 않는다', () => {
    render(<MarqueeText text="생활관 가을 야식 파티 참가 신청" />);
    expect(screen.getAllByText('생활관 가을 야식 파티 참가 신청')).toHaveLength(1);
  });

  it('움직임 줄이기 설정이면 말줄임표로 자른다', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce'), media: query }));
    render(<MarqueeText text="공용 냉장고 정리의 날 (9/30) — 이름 없는 식품은 폐기돼요" />);
    expect(screen.getByText('공용 냉장고 정리의 날 (9/30) — 이름 없는 식품은 폐기돼요')).toHaveClass('truncate');
  });
});
