import { Switch } from '@shared/ui';

interface PreferenceRowProps {
  label: string;
  /** 이름 옆에 붙는 짧은 보조 문구 */
  hint?: string;
  /** 이름 아래 줄 설명. 있으면 행을 더 높게 그린다. */
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function PreferenceRow({ label, hint, description, checked, disabled = false, onChange }: PreferenceRowProps) {
  return (
    <div className={[
      'flex items-center gap-4 px-5 transition-opacity',
      description ? 'min-h-17' : 'min-h-14',
      disabled ? 'opacity-40' : '',
    ].join(' ')}>
      {description ? (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-body font-semibold text-fg-strong">{label}</span>
          <span className="text-body-sm leading-[1.4] text-fg-subtle">{description}</span>
        </span>
      ) : (
        <span className="flex min-w-0 flex-1 items-baseline gap-2 whitespace-nowrap">
          <span className="text-body font-medium text-fg-strong">{label}</span>
          {hint ? <span className="text-body-sm text-fg-subtle">{hint}</span> : null}
        </span>
      )}
      <Switch label={label} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
