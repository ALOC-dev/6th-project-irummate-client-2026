import type { SVGProps } from 'react';

type DormIconName = 'bell' | 'calendar' | 'chat' | 'chevron-left' | 'chevron-right' | 'refresh';

export function DormIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: DormIconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg {...props} {...common} viewBox="0 0 24 24" aria-hidden="true">
      {name === 'bell' ? <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></> : null}
      {name === 'calendar' ? <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></> : null}
      {name === 'chat' ? <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5A8 8 0 1 1 21 15z" /><path d="M8 10h8M8 14h5" /></> : null}
      {name === 'chevron-left' ? <path d="m15 18-6-6 6-6" /> : null}
      {name === 'chevron-right' ? <path d="m9 18 6-6-6-6" /> : null}
      {name === 'refresh' ? <><path d="M20 6v5h-5" /><path d="M4 18v-5h5" /><path d="M18.5 9a7 7 0 0 0-12-2L4 11M5.5 15a7 7 0 0 0 12 2l2.5-4" /></> : null}
    </svg>
  );
}
