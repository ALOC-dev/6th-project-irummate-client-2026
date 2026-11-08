import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconButtonVariant = 'primary' | 'glass' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
}

const BASE = [
  'inline-flex shrink-0 items-center justify-center rounded-pill',
  'transition-[background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-irum-out',
  'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
  'active:scale-[var(--press-scale)] disabled:pointer-events-none disabled:opacity-40',
].join(' ');

const VARIANTS: Record<IconButtonVariant, string> = {
  primary: 'bg-primary text-fg-on-brand shadow-brand hover:bg-primary-hover',
  glass: [
    'bg-surface-card text-fg-body shadow-sm ring-1 ring-inset ring-glass-edge',
    '[backdrop-filter:var(--glass-filter)] hover:bg-glass-soft',
  ].join(' '),
  ghost: 'bg-transparent text-fg-body hover:bg-primary-soft',
  danger: 'bg-danger-soft text-danger hover:bg-coral-100',
};

const SIZES: Record<IconButtonSize, string> = {
  sm: 'size-11',
  md: 'size-12',
  lg: 'size-14',
};

export function IconButton({
  label,
  variant = 'glass',
  size = 'md',
  type = 'button',
  className,
  children,
  ...props
}: IconButtonProps) {
  const classes = [BASE, VARIANTS[variant], SIZES[size], className].filter(Boolean).join(' ');

  return (
    <button {...props} type={type} className={classes} aria-label={label}>
      {children}
    </button>
  );
}
