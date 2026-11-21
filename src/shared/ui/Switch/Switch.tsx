import type { ButtonHTMLAttributes } from 'react';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'onChange' | 'role'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** 화면에 보이는 항목 이름과 같은 글자. 보조 기술이 읽는다. */
  label: string;
}

/** 켜고 끄는 스위치. role="switch"와 aria-checked로 상태를 알린다. */
export function Switch({ checked, onCheckedChange, label, disabled, className, ...props }: SwitchProps) {
  const track = checked ? 'bg-primary' : disabled ? 'bg-ink-100' : 'bg-ink-200';

  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={[
        'relative h-7.5 w-12.5 shrink-0 rounded-pill p-0 transition-colors duration-[var(--duration-base)] ease-irum-out',
        'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:cursor-not-allowed',
        track,
        className,
      ].filter(Boolean).join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute left-0.5 top-0.5 size-6.5 rounded-pill bg-fg-on-brand shadow-sm',
          'transition-transform duration-[var(--duration-base)] ease-irum-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}
