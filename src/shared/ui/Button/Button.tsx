import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

const BASE = [
  'inline-flex items-center justify-center gap-2 rounded-control font-semibold',
  'transition-[background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-irum-out',
  'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
  'active:scale-[var(--press-scale)] disabled:pointer-events-none',
].join(' ');

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-fg-on-brand shadow-brand hover:bg-primary-hover active:bg-primary-pressed',
  secondary: [
    'bg-surface-card text-fg-strong shadow-sm ring-1 ring-inset ring-glass-edge',
    '[backdrop-filter:var(--glass-filter)] hover:bg-glass-soft',
  ].join(' '),
  ghost: 'bg-transparent text-fg-body hover:bg-primary-soft active:bg-primary-soft-hover',
  danger: 'bg-danger text-fg-on-brand shadow-sm hover:bg-danger-hover active:bg-danger-pressed',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-11 px-4 text-body-sm',
  md: 'h-12 px-5 text-body',
  lg: 'h-14 px-6 text-title-3',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = '처리 중',
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    disabled && !loading && 'opacity-40',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-pill border-2 border-current border-r-transparent motion-reduce:animate-none"
          />
          <span>{loadingLabel}</span>
        </>
      ) : children}
    </button>
  );
}
