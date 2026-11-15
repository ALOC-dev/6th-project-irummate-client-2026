import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  leading?: ReactNode;
  count?: number;
}

export function FilterChip({
  selected = false,
  leading,
  count,
  className,
  children,
  type = 'button',
  ...props
}: FilterChipProps) {
  const classes = [
    'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-pill px-4 text-body-sm font-semibold',
    'transition-[background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-irum-out',
    'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] active:scale-[var(--press-scale)]',
    selected
      ? 'bg-primary text-fg-on-brand shadow-brand'
      : 'bg-surface-card text-fg-body shadow-xs ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)] hover:bg-glass-soft',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button {...props} type={type} className={classes} aria-pressed={selected}>
      {leading ? <span aria-hidden="true">{leading}</span> : null}
      <span>{children}</span>
      {typeof count === 'number' ? (
        <span className={selected ? 'text-fg-on-brand' : 'text-fg-brand'}>{count}</span>
      ) : null}
    </button>
  );
}
