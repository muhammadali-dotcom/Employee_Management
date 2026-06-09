import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-2xl',
  lg: 'px-5 py-3 text-base rounded-2xl',
};

const getVariantStyle = (variant: Variant): React.CSSProperties => {
  switch (variant) {
    case 'primary':
      return {
        background: 'linear-gradient(135deg, var(--accent), #ffdc63)',
        color: '#111111',
        borderColor: 'var(--border-accent)',
        boxShadow: '0 14px 30px rgba(255, 193, 7, 0.22)',
      };

    case 'secondary':
      return {
        background: 'var(--bg-surface-soft)',
        color: 'var(--text-primary)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--card-shadow)',
      };

    case 'danger':
      return {
        background: 'var(--danger-soft)',
        color: 'var(--danger)',
        borderColor: 'rgba(255, 77, 79, 0.28)',
        boxShadow: '0 14px 30px rgba(255, 77, 79, 0.10)',
      };

    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--text-secondary)',
        borderColor: 'transparent',
        boxShadow: 'none',
      };

    default:
      return {};
  }
};

const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  style,
  ...props
}: ButtonProps) => {
  const variantStyle = getVariantStyle(variant);

  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 border font-black
        transition-all duration-200
        hover:-translate-y-0.5 hover:brightness-105
        active:translate-y-0
        focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]
        disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        ...variantStyle,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export default Button;