import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('제목과 보조 문구, 액션을 보여준다', () => {
    render(<PageHeader title="매이트" eyebrow="함께하면 더 즐거워요" actions={<button type="button">알림</button>} />);
    expect(screen.getByRole('heading', { name: '매이트' })).toBeInTheDocument();
    expect(screen.getByText('함께하면 더 즐거워요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('pt-[var(--safe-area-top)]');
  });

  it('워드마크 이미지를 제목으로 쓰고 아래 설명 줄을 보여준다', () => {
    render(<PageHeader title={<img src="/brand/mate-wordmark-blue.png" alt="매이트" />} subtitle="현재 접속 중" />);
    expect(screen.getByRole('heading', { name: '매이트' })).toBeInTheDocument();
    expect(screen.getByText('현재 접속 중')).toBeInTheDocument();
  });
});

describe('PageHeader align', () => {
  it('center면 제목을 가운데 두고 비어 있는 쪽에도 같은 너비 자리를 둔다', () => {
    const { container } = render(<PageHeader title="알림 설정" align="center" leading={<button type="button">뒤로</button>} />);
    expect(screen.getByRole('heading', { name: '알림 설정' }).parentElement).toHaveClass('text-center');
    expect(container.querySelectorAll('.min-w-11')).toHaveLength(2);
  });
});
