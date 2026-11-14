import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('제목과 보조 문구, 액션을 보여준다', () => {
    render(<PageHeader title="매이트" eyebrow="함께하면 더 즐거워요" actions={<button type="button">알림</button>} />);
    expect(screen.getByRole('heading', { name: '매이트' })).toBeInTheDocument();
    expect(screen.getByText('함께하면 더 즐거워요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
  });
});
