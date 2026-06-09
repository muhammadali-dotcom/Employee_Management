import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = ({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  style,
  ...props
}: SelectProps) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-bold"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          {...props}
          className={`
            w-full appearance-none rounded-2xl border px-4 py-3 pr-10 text-sm font-medium
            outline-none transition-all duration-200
            focus:border-[var(--border-accent)]
            focus:ring-4 focus:ring-[var(--accent-soft)]
            disabled:cursor-not-allowed disabled:opacity-60
            ${className}
          `}
          style={{
            background: error ? 'var(--danger-soft)' : 'var(--input-bg)',
            borderColor: error
              ? 'rgba(255, 77, 79, 0.45)'
              : 'var(--input-border)',
            color: 'var(--text-primary)',
            boxShadow: error ? '0 0 0 4px var(--danger-soft)' : 'none',
            ...style,
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              style={{
                background: 'var(--bg-surface-solid)',
                color: 'var(--text-primary)',
              }}
            >
              {option.label}
            </option>
          ))}
        </select>

        <span
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          ▼
        </span>
      </div>

      {error && (
        <p
          className="text-xs font-semibold"
          style={{ color: 'var(--danger)' }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;