import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { matePostFixtures } from '../model/fixtures';
import { formatShortDateTime } from '../model/formatDateTime';
import type { MatePost } from '../model/types';
import { MatePostSheet } from './MatePostSheet';

function postWith(category: MatePost['category']): MatePost {
  const post = matePostFixtures.find((item) => item.category === category);
  if (!post) throw new Error(`${category} 목 모집 글이 없어요`);
  return post;
}

function valueOf(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;
}

describe('MatePostSheet', () => {
  it.each([
    ['밥', 'MEAL', '활동'],
    ['공동구매', 'GROUP_BUY', '수령'],
  ] as const)('%s 글은 %s 일시와 마감 일시를 두 줄로 보여 준다', (_, category, activityLabel) => {
    const post = postWith(category);
    render(<MatePostSheet post={post} onClose={vi.fn()} onBookmark={vi.fn()} onJoin={vi.fn()} />);

    expect(valueOf(activityLabel)).toBe(formatShortDateTime(post.activityAt));
    expect(valueOf('마감')).toBe(formatShortDateTime(post.deadlineAt));
    expect(screen.queryByText('일시', { selector: 'dt' })).not.toBeInTheDocument();
  });
});
