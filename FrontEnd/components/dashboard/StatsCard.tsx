'use client';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: string;
  iconBg: string;       // background color for icon box
  iconColor: string;    // text/icon color
  active?: boolean;     // is this card currently selected?
  onClick?: () => void;
}

export default function StatsCard({ label, value, icon, iconBg, iconColor, active, onClick }: StatsCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border p-5 flex items-center gap-4 transition-all"
      style={{
        backgroundColor: active ? 'var(--bg-hover)' : 'var(--bg-surface)',
        borderColor: active ? '#0a66c2' : 'var(--border)',
        boxShadow: active ? '0 0 0 2px #0a66c2' : 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Icon box */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>

      {/* Active indicator */}
      {active && (
        <div className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          Filtered
        </div>
      )}
    </button>
  );
}
