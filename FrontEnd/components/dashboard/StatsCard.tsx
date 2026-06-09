'use client';
import { ReactNode } from 'react';
interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  active?: boolean;
  onClick?: () => void;
}

const StatsCard = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  active,
  onClick,
}: StatsCardProps) => {
  const numericValue = typeof value === 'number' ? value : Number(value) || 0;

  const safeId = label.replace(/[^a-zA-Z0-9]/g, '-');

  const getPercentText = () => {
    if (label === 'Total Employees') return '↑ 12 this month';
    if (label === 'Active') return '77.4% of total';
    if (label === 'On Break') return '4.8% of total';
    if (label === 'On Leave') return '7.3% of total';
    if (label === 'Absent') return '6.5% of total';
    if (label === 'Inactive') return '4.0% of total';
    return 'This month';
  };

  const getLineColor = () => {
    if (label === 'Active') return 'var(--success)';
    if (label === 'On Break') return 'var(--accent)';
    if (label === 'On Leave') return 'var(--info)';
    if (label === 'Absent') return 'var(--danger)';
    if (label === 'Inactive') return '#94a3b8';
    return 'var(--success)';
  };

  const lineColor = getLineColor();

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative h-[126px] w-full overflow-hidden rounded-[var(--radius-lg)]
        border p-3 text-left transition-all duration-300
        hover:-translate-y-0.5
      "
      style={{
        background: active
          ? 'linear-gradient(135deg, var(--accent-soft), var(--card-bg))'
          : 'var(--card-bg)',
        borderColor: active ? 'var(--border-accent)' : 'var(--border)',
        boxShadow: active
          ? '0 14px 32px rgba(255, 193, 7, 0.20)'
          : 'var(--card-shadow)',
        cursor: onClick ? 'pointer' : 'default',
        backdropFilter: 'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
      }}
    >
      {/* Glow */}
      <div
        className="
          pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full
          opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-70
        "
        style={{ background: iconColor }}
      />

      {/* Active dot instead of big Filtered badge */}
      {active && (
        <span
          className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 0 0 5px var(--accent-soft)',
          }}
        />
      )}

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="
              flex h-10 w-10 flex-shrink-0 items-center justify-center
              rounded-2xl text-xl transition-transform duration-300
              group-hover:scale-105
            "
            style={{
              background: iconBg,
              color: iconColor,
              boxShadow: `0 10px 24px ${iconBg}`,
            }}
          >
            {icon}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p
              className="line-clamp-1 text-[13px] font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}
              title={label}
            >
              {label}
            </p>

            <p
              className="mt-1 text-2xl font-black leading-none tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {numericValue.toLocaleString()}
            </p>

            <p
              className="mt-2 line-clamp-1 text-[11px] font-semibold"
              style={{
                color:
                  label === 'Total Employees'
                    ? 'var(--success)'
                    : 'var(--text-secondary)',
              }}
            >
              {getPercentText()}
            </p>
          </div>
        </div>

        {/* Mini chart */}
        <div className="h-6 w-full">
          <svg
            viewBox="0 0 180 36"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient
                id={`lineGradient-${safeId}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                <stop offset="50%" stopColor={lineColor} stopOpacity="1" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.45" />
              </linearGradient>
            </defs>

            <path
              d="M0 27 L15 18 L30 22 L45 16 L60 21 L75 19 L90 25 L105 18 L120 23 L135 16 L150 21 L165 13 L180 19"
              fill="none"
              stroke={`url(#lineGradient-${safeId})`}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M0 36 L0 27 L15 18 L30 22 L45 16 L60 21 L75 19 L90 25 L105 18 L120 23 L135 16 L150 21 L165 13 L180 19 L180 36 Z"
              fill={lineColor}
              opacity="0.08"
            />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default StatsCard;