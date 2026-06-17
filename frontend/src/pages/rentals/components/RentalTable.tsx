import { memo } from 'react';
import { Rental, RentalStatus } from 'types/rentals';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const STATUS_CONFIG: Record<RentalStatus, { cls: string; icon: string }> = {
  booked:    { cls: 'badge-gold',    icon: 'calendar' },
  out:       { cls: 'badge-emerald', icon: 'pos' },
  returned:  { cls: 'badge-success', icon: 'check-circle' },
  overdue:   { cls: 'badge-error',   icon: 'warning' },
  cancelled: { cls: 'badge-neutral', icon: 'close' },
};

const STATUS_BADGE: Record<string, string> = {
  booked:   'badge-gold',
  out:      'badge-emerald',
  overdue:  'badge-error',
  returned: 'badge-success',
};

export const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;
export const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const daysLeft = (returnDate: string) => Math.ceil((new Date(returnDate).getTime() - Date.now()) / 86400000);

interface RentalTableProps {
  filtered: Rental[];
  setSelected: (r: Rental) => void;
}

export const RentalTable = memo(({ filtered, setSelected }: RentalTableProps) => {
  return (
    <div className="panel p-0 overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">Order</th>
            <th className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">Customer</th>
            <th className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">Items</th>
            <th className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">Event</th>
            <th className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">Pickup</th>
            <th className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">Return</th>
            <th className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">Deposit</th>
            <th className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => {
            const isOverdue = r.status === 'out' && daysLeft(r.returnDate) < 0;
            const computedStatus = isOverdue ? 'overdue' : r.status;
            const days = daysLeft(r.returnDate);
            const cfg = STATUS_CONFIG[computedStatus] || { cls: 'badge-neutral', icon: 'help-circle' };
            const customerName = r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : 'Unknown';
            const phone = r.customer ? r.customer.phone : '';

            return (
              <tr key={r.id} className="table-row" onClick={() => { setSelected(r); }}>
                <td><code className="text-[.8rem] text-[var(--accent-gold-text)] font-bold">{r.rentalNo}</code></td>
                <td>
                  <div className="font-semibold text-[.875rem]">{customerName}</div>
                  <div className="text-[.75rem] text-[var(--text-muted)]">{phone}</div>
                </td>
                <td>
                  <div className="text-[.8rem] max-w-[160px]">
                    {r.items && r.items.length > 0 ? r.items[0].productName : 'No items'}
                    {r.items && r.items.length > 1 && <span className="text-[var(--text-muted)]"> +{r.items.length - 1} more</span>}
                  </div>
                </td>
                <td className="text-[.82rem] text-[var(--text-secondary)] max-w-[140px]">{r.eventName}</td>
                <td className="text-[.82rem] whitespace-nowrap">{fmtDate(r.pickupDate)}</td>
                <td className="text-[.82rem] whitespace-nowrap">
                  {fmtDate(r.returnDate)}
                  {r.status === 'out' && days < 0 && (
                    <div className="text-[.7rem] text-[var(--status-error)] font-bold">{Math.abs(days)}d overdue</div>
                  )}
                  {r.status === 'out' && days >= 0 && (
                    <div className="text-[.7rem] text-[var(--status-success)]">{days}d left</div>
                  )}
                </td>
                <td className="text-[var(--accent-gold-text)] font-bold">{fmt(r.depositPaid)}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE[computedStatus] ?? 'badge-neutral'} capitalize inline-flex items-center gap-[6px]`}>
                    <SvgIcon name={cfg.icon} width="12" height="12" /> {computedStatus}
                  </span>
                  {r.notes && (
                    <div className="text-[.7rem] text-[var(--status-warning)] mt-1 flex items-center gap-1">
                      <SvgIcon name="warning" width="10" height="10" /> Note
                    </div>
                  )}
                </td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); setSelected(r); }}>View</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <SvgIcon name="rentals" width="48" height="48" className="opacity-30" />
          </div>
          <p>No rentals found</p>
        </div>
      )}
    </div>
  );
});
