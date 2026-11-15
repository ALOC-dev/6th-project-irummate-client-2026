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
  const filled = name === 'bell' || name === 'chat';
  const common = filled
    ? { fill: 'currentColor' }
    : { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg {...props} {...common} viewBox="0 0 24 24" aria-hidden="true">
      {name === 'bell' ? <path d="M12 22c-1.21 0-2.38-.4-3.29-1.13a1 1 0 0 1 1.25-1.57c1.12.89 2.97.89 4.08 0a1 1 0 0 1 1.25 1.57A5.2 5.2 0 0 1 12 22Zm7.5-3.81H4.51c-.54 0-1.03-.31-1.3-.83a1.7 1.7 0 0 1 .08-1.77c.45-.65.99-1.7.99-3.04l.02-2.2C4.3 5.76 7.76 2.01 12.01 2.01c4.3 0 7.81 3.79 7.81 8.46l-.02 2.09c0 1.35.52 2.41.95 3.07.33.5.36 1.19.05 1.76-.28.49-.76.8-1.3.8Zm-14.23-2h13.47a7.54 7.54 0 0 1-.96-3.64l.02-2.09c0-3.55-2.6-6.45-5.81-6.45-3.15 0-5.71 2.85-5.71 6.35l-.02 2.2c.01 1.5-.47 2.74-.99 3.63Z" /> : null}
      {name === 'bookmark' ? <path d="M6 3h12v18l-6-4-6 4z" /> : null}
      {name === 'chat' ? <path d="M5.1 22.1c-.5 0-.9-.1-1.4-.2-.3-.1-.6-.3-.8-.5l-.1-.1c-.1-.1-.2-.3-.2-.4 0-.2.1-.3.3-.4.8-.4 1.5-1.1 1.9-1.9.1-.1.2-.2.2-.3C2.2 16.6.5 13.9.5 11 .5 6 5.7 1.8 12 1.8S23.5 6 23.5 11c0 5-5.2 9.2-11.5 9.2-.6 0-1.3 0-1.9-.1-1.5 1.3-3.3 2-5 2Z" /> : null}
      {name === 'clock' ? <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> : null}
      {name === 'map' ? <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2" /></> : null}
      {name === 'people' ? <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> : null}
      {name === 'plus' ? <path d="M12 5v14M5 12h14" /> : null}
      {name === 'search' ? <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></> : null}
      {name === 'sort' ? <><path d="M3 6h18M6 12h12M9 18h6" /></> : null}
    </svg>
  );
}
