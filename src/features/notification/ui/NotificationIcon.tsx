import type { SVGProps } from 'react';

// 다른 feature 아이콘에 없는 것만 둔다. 모양은 Lucide 경로이고 색은 글자색을 따른다.
// heart는 채팅 목록의 브랜드 아이콘처럼 속을 채운 모양으로 그린다.
const PATHS = {
  heart: [
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  ],
  settings: [
    'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
  ],
} satisfies Record<string, string[]>;

const FILLED: Partial<Record<keyof typeof PATHS, true>> = { heart: true };

const CIRCLES: Partial<Record<keyof typeof PATHS, Array<[number, number, number]>>> = {
  settings: [[12, 12, 3]],
};

export type NotificationIconName = keyof typeof PATHS;

export function NotificationIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: NotificationIconName }) {
  return (
    <svg fill={FILLED[name] ? 'currentColor' : 'none'} {...props} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name].map((d) => <path key={d} d={d} />)}
      {CIRCLES[name]?.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
    </svg>
  );
}
