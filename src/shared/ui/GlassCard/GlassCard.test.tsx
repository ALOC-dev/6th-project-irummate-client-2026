import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GlassCard } from './GlassCard';

describe('GlassCard', () => {
  it('내용과 추가 속성을 전달한다', () => {
    render(<GlassCard aria-label="추천 메이트">민지</GlassCard>);

    expect(screen.getByLabelText('추천 메이트')).toHaveTextContent('민지');
  });
});
