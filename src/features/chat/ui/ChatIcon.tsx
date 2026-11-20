import type { SVGProps } from 'react';

const PATHS = {
  'arrow-left': ['m15 18-6-6 6-6'],
  chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  more: [],
  pin: [
    'M12 17v5',
    'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z',
  ],
  plus: ['M5 12h14', 'M12 5v14'],
  search: ['m21 21-4.3-4.3'],
  send: [
    'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z',
    'm21.854 2.147-10.94 10.939',
  ],
} satisfies Record<string, string[]>;

export type ChatIconName = keyof typeof PATHS;

export function ChatIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: ChatIconName }) {
  return (
    <svg fill="none" {...props} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'search' ? <circle cx="11" cy="11" r="8" /> : null}
      {name === 'more' ? [5, 12, 19].map((cx) => <circle key={cx} cx={cx} cy="12" r="1" fill="currentColor" />) : null}
      {PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
