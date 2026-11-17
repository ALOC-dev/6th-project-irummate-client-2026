const TINTS = ['bg-primary-soft', 'bg-info-soft', 'bg-mint-100', 'bg-sun-100', 'bg-peach-100'] as const;

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

function tintFor(name: string) {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return TINTS[sum % TINTS.length];
}

export function Avatar({ name = '', src, size = 40, className }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name || '프로필'}
      style={{ width: size, height: size }}
      className={[
        'inline-flex shrink-0 overflow-hidden rounded-pill shadow-[inset_0_0_0_1px_var(--color-border-subtle)]',
        src ? '' : 'bg-[url(/brand/avatar-default.png)] bg-[length:112%] bg-[position:50%_30%] bg-no-repeat',
        tintFor(name),
        className,
      ].filter(Boolean).join(' ')}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : null}
    </span>
  );
}
