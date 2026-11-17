import type { SVGProps } from 'react';

const PATHS = {
  bookmark: ['m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'],
  calendar: ['M8 2v4', 'M16 2v4', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M3 10h18'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  check: ['M20 6 9 17l-5-5'],
  clock: ['M12 6v6h4.5'],
  dollar: ['M12 2v20', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  ellipsis: [],
  'hand-heart': [
    'M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16',
    'm7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9',
    'm2 15 6 6',
    'M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z',
  ],
  map: ['M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'],
  palette: ['M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z'],
  pencil: [
    'M12 20h9',
    'M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z',
  ],
  search: ['m21 21-4.3-4.3'],
  utensils: ['M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2', 'M7 2v20', 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'],
  wallet: [
    'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1',
    'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4',
  ],
  x: ['M18 6 6 18', 'm6 6 12 12'],
} satisfies Record<string, string[]>;

const CIRCLES: Partial<Record<keyof typeof PATHS, Array<[number, number, number]>>> = {
  clock: [[12, 12, 10]],
  ellipsis: [[5, 12, 1], [12, 12, 1], [19, 12, 1]],
  map: [[12, 10, 3]],
  palette: [[13.5, 6.5, 0.5], [17.5, 10.5, 0.5], [6.5, 12.5, 0.5], [8.5, 7.5, 0.5]],
  search: [[11, 11, 8]],
};

export type MateIconName = keyof typeof PATHS;

export function MateIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: MateIconName }) {
  return (
    <svg fill="none" {...props} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name].map((d) => <path key={d} d={d} />)}
      {CIRCLES[name]?.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={r < 1.5 ? 'currentColor' : 'none'} />)}
    </svg>
  );
}
