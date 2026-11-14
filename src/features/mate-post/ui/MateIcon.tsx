import type { SVGProps } from 'react';

export type MateIconName =
  | 'bell'
  | 'bookmark'
  | 'chat'
  | 'clock'
  | 'map'
  | 'people'
  | 'plus'
  | 'search'
  | 'sort';

export function MateIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: MateIconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg {...props} {...common} viewBox="0 0 24 24" aria-hidden="true">
      {name === 'bell' ? <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></> : null}
      {name === 'bookmark' ? <path d="M6 3h12v18l-6-4-6 4z" /> : null}
      {name === 'chat' ? <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5A8 8 0 1 1 21 15z" /><path d="M8 10h8M8 14h5" /></> : null}
      {name === 'clock' ? <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> : null}
      {name === 'map' ? <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2" /></> : null}
      {name === 'people' ? <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> : null}
      {name === 'plus' ? <path d="M12 5v14M5 12h14" /> : null}
      {name === 'search' ? <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></> : null}
      {name === 'sort' ? <><path d="M3 6h18M6 12h12M9 18h6" /></> : null}
    </svg>
  );
}
