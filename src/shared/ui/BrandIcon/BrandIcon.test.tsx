import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BrandIcon } from './BrandIcon';

describe('BrandIcon', () => {
  it('브랜드 아이콘 모양을 마스크로 쓰고 글자색으로 칠한다', () => {
    const { container } = render(<BrandIcon name="cart" className="size-5" />);
    const icon = container.querySelector('[data-brand-icon="cart"]');
    expect(icon).toHaveClass('bg-current', 'size-5');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon?.getAttribute('style')).toContain('/brand/icon-cart.png');
  });
});
