interface PreferenceSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function PreferenceSwitch({ label, description, checked, disabled = false, onChange }: PreferenceSwitchProps) {
  return (
    <label className={['flex min-h-18 items-center gap-4 px-4 py-3', disabled ? 'opacity-50' : ''].join(' ')}>
      <span className="min-w-0 flex-1">
        <span className="block text-body-sm font-bold text-fg-strong">{label}</span>
        {description ? <span className="mt-1 block text-caption leading-5 text-fg-muted">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className="relative h-8 w-13 shrink-0 rounded-pill bg-ink-200 shadow-inner transition-colors peer-checked:bg-primary peer-focus-visible:shadow-[var(--focus-ring)] peer-disabled:cursor-not-allowed after:absolute after:left-1 after:top-1 after:size-6 after:rounded-pill after:bg-surface-card after:shadow-sm after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}
