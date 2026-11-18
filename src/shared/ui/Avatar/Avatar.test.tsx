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

  it('색을 지정하면 그 색의 캐릭터 이미지를 쓴다', () => {
    const { container } = render(<Avatar name="지아" tone="lavender" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/brand/avatars/lavender.webp');
  });

  it('색을 지정하지 않아도 같은 이름은 항상 같은 색이 된다', () => {
    const { container } = render(<><Avatar name="태린" /><Avatar name="태린" /></>);
    const [first, second] = [...container.querySelectorAll('img')].map((image) => image.getAttribute('src'));
    expect(first).toMatch(/^\/brand\/avatars\/[a-z]+\.webp$/);
    expect(second).toBe(first);
  });

  it('사람 번호를 주면 번호가 이웃한 사람끼리 색이 겹치지 않는다', () => {
    const { container } = render(<>{[1, 2, 3, 4, 5, 6, 7, 8].map((id) => <Avatar key={id} name="같은 이름" seed={id} />)}</>);
    const sources = [...container.querySelectorAll('img')].map((image) => image.getAttribute('src'));
    expect(new Set(sources).size).toBe(8);
  });

  it('사진이 있으면 사진을 쓴다', () => {
    const { container } = render(<Avatar name="지아" src="https://example.com/me.jpg" />);
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/me.jpg');
  });

  it('장식용이면 화면 읽기 프로그램에서 숨긴다', () => {
    render(<Avatar name="지아" decorative />);
    expect(screen.queryByRole('img', { name: '지아' })).not.toBeInTheDocument();
  });
});
