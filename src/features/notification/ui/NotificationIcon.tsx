import type { SVGProps } from 'react';

type NotificationIconName = 'arrow-left' | 'bell' | 'moon';

export function NotificationIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: NotificationIconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg {...props} {...common} viewBox="0 0 24 24" aria-hidden="true">
      {name === 'arrow-left' ? <path d="m15 18-6-6 6-6" /> : null}
      {name === 'bell' ? <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></> : null}
      {name === 'moon' ? <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /> : null}
    </svg>
  );
}
