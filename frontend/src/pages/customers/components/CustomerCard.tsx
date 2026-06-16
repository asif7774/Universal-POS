import { memo } from 'react';
import { Customer } from 'types/customers';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface CustomerCardProps {
  c: Customer;
  onClick: () => void;
}

const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;

export const CustomerCard = memo(({ c, onClick }: CustomerCardProps) => (
  <div
    className="panel hover:bg-[var(--bg-panel-hover)] cursor-pointer p-4 transition-all"
    data-id={c.id}
    onClick={onClick}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
  >
    <div className="flex gap-3 items-start">
      <div className="w-10 h-10 rounded-full bg-[var(--accent-gold-subtle)] text-[var(--accent-gold-text)] font-black text-sm flex items-center justify-center shrink-0">
        {c.firstName[0]}{c.lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[var(--text-primary)] font-semibold text-[0.95rem]">{c.firstName} {c.lastName}</span>
          {c.tags?.includes('VIP') && <span className="badge badge-gold">VIP</span>}
        </div>
        <div className="text-[var(--text-muted)] text-xs mb-0.5">{c.email}</div>
        <div className="text-[var(--text-muted)] text-xs">{c.phone}</div>
      </div>
    </div>

    <div className="divider" />

    <div className="grid grid-cols-3 gap-2 text-center">
      <div>
        <div className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">{c.totalOrders}</div>
        <div className="text-[0.7rem] text-[var(--text-muted)] uppercase tracking-wide">Orders</div>
      </div>
      <div>
        <div className="text-sm font-bold text-[var(--accent-gold-text)]">{fmt(c.totalSpent)}</div>
        <div className="text-[0.7rem] text-[var(--text-muted)] uppercase tracking-wide">Spent</div>
      </div>
      <div>
        <div>
          <span className="badge badge-gold">{c.loyaltyPoints}</span>
        </div>
        <div className="text-[0.7rem] text-[var(--text-muted)] uppercase tracking-wide mt-0.5">Points</div>
      </div>
    </div>

    {c.tags && c.tags.length > 0 && (
      <div className="flex gap-1 flex-wrap mt-2.5">
        {c.tags.filter(t => t !== 'VIP').map(tag => (
          <span key={tag} className={`badge ${tag === 'Overdue' ? 'badge-error' : tag === 'Corporate' ? 'badge-neutral' : 'badge-neutral'}`}>
            {tag}
          </span>
        ))}
      </div>
    )}

    {c.notes && (
      <div className="mt-2 text-xs text-[var(--status-warning)] border-t border-[var(--border-subtle)] pt-2 flex gap-1.5 items-center">
        <SvgIcon name="warning" width="12" height="12" /> {c.notes}
      </div>
    )}
  </div>
));
