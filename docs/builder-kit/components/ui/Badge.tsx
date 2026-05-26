'use client';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export default function Badge({ children, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-sm
        text-[var(--text-xs)] font-body font-semibold uppercase tracking-widest
        ${className}
      `}
      style={{
        backgroundColor: color ? `${color}20` : 'var(--flot-glow)',
        color: color || 'var(--flot)',
        border: `1px solid ${color ? `${color}40` : 'var(--flot)'}`,
      }}
    >
      {children}
    </span>
  );
}
