import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({
  label,
  error,
  className = '',
  id,
  style,
  ...props
}: InputProps) => {
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

      <input
        id={id}
        {...props}
        className={`
          w-full rounded-2xl border px-4 py-3 text-sm font-medium
          outline-none transition-all duration-200
          placeholder:text-[var(--text-muted)]
          focus:border-[var(--border-accent)]
          focus:ring-4 focus:ring-[var(--accent-soft)]
          disabled:cursor-not-allowed disabled:opacity-60
          ${className}
        `}
        style={{
          background: error ? 'var(--danger-soft)' : 'var(--input-bg)',
          borderColor: error ? 'rgba(255, 77, 79, 0.45)' : 'var(--input-border)',
          color: 'var(--text-primary)',
          boxShadow: error ? '0 0 0 4px var(--danger-soft)' : 'none',
          ...style,
        }}
      />

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

export default Input;