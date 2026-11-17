import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('이름을 접근성 이름으로 쓰고 크기를 맞춘다', () => {
    render(<Avatar name="지아" size={32} />);
    const avatar = screen.getByRole('img', { name: '지아' });
    expect(avatar).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('이름이 없으면 프로필로 읽는다', () => {
    render(<Avatar />);
    expect(screen.getByRole('img', { name: '프로필' })).toBeInTheDocument();
  });
});
