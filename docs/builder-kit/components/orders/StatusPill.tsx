import type { OrderStatus } from '@/lib/orders/types';

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending:   { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Pending' },
  confirmed: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Confirmed' },
  fulfilled: { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e', label: 'Fulfilled' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444', label: 'Cancelled' },
};

export default function StatusPill({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}
