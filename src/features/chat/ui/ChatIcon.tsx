import type { SVGProps } from 'react';

type ChatIconName = 'arrow-left' | 'chat' | 'more' | 'send';

export function ChatIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: ChatIconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg {...props} {...common} viewBox="0 0 24 24" aria-hidden="true">
      {name === 'arrow-left' ? <path d="m15 18-6-6 6-6" /> : null}
      {name === 'chat' ? <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5A8 8 0 1 1 21 15z" /><path d="M8 10h8M8 14h5" /></> : null}
      {name === 'more' ? <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></> : null}
      {name === 'send' ? <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></> : null}
    </svg>
  );
}
