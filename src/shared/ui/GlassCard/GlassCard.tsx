import type { HTMLAttributes, ReactNode } from 'react';

export type GlassCardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: GlassCardPadding;
  children: ReactNode;
}

const PADDING: Record<GlassCardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function GlassCard({ padding = 'md', className, children, ...props }: GlassCardProps) {
  const classes = [
    'rounded-card bg-surface-card shadow-glass ring-1 ring-inset ring-glass-edge',
    '[backdrop-filter:var(--glass-filter)]',
    PADDING[padding],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div {...props} className={classes}>
      {children}
    </div>
  );
}
