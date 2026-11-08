import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  labelHidden?: boolean;
  helperText?: string;
  errorMessage?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
}

export function TextField({
  id,
  label,
  labelHidden = false,
  helperText,
  errorMessage,
  leading,
  trailing,
  containerClassName,
  className,
  disabled,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = helperText && !errorMessage ? `${inputId}-helper` : undefined;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ') || undefined;
  const inputClasses = [
    'h-12 w-full rounded-control bg-glass-input px-4 text-body text-fg-strong shadow-xs',
    'ring-1 ring-inset placeholder:text-fg-subtle focus:outline-none focus:shadow-[var(--focus-ring)]',
    'transition-[box-shadow] duration-[var(--duration-fast)] ease-irum-out',
    errorMessage ? 'ring-danger' : 'ring-border-subtle focus:ring-border-focus',
    leading && 'pl-11',
    trailing && 'pr-11',
    'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:opacity-60',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={['w-full', containerClassName].filter(Boolean).join(' ')}>
      <label
        htmlFor={inputId}
        className={labelHidden ? 'sr-only' : 'mb-2 block text-body-sm font-semibold text-fg-body'}
      >
        {label}
      </label>
      <div className="relative">
        {leading ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-fg-muted"
          >
            {leading}
          </span>
        ) : null}
        <input
          {...props}
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={errorMessage ? true : ariaInvalid}
          aria-describedby={describedBy}
        />
        {trailing ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-fg-muted"
          >
            {trailing}
          </span>
        ) : null}
      </div>
      {errorMessage ? (
        <p id={errorId} className="mt-2 text-caption text-danger">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-2 text-caption text-fg-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
