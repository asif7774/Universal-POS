import { memo } from 'react';
import { Rental, RentalStatus } from 'types/rentals';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const STATUS_CONFIG: Record<RentalStatus, { cls: string; icon: string }> = {
  booked:    { cls: 'rental-booked',    icon: 'calendar' },
  out:       { cls: 'rental-out',       icon: 'pos' },
  returned:  { cls: 'rental-available', icon: 'check-circle' },
  overdue:   { cls: 'rental-overdue',   icon: 'warning' },
  cancelled: { cls: 'badge-gray',       icon: 'close' },
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
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Event</th>
            <th>Pickup</th>
            <th>Return</th>
            <th>Deposit</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => {
            const isOverdue = r.status === 'out' && daysLeft(r.returnDate) < 0;
            const computedStatus = isOverdue ? 'overdue' : r.status;
            const days = daysLeft(r.returnDate);
            const cfg = STATUS_CONFIG[computedStatus as RentalStatus] || { cls: 'badge-gray', icon: 'help-circle' };
            const customerName = r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : 'Unknown';
            const phone = r.customer ? r.customer.phone : '';
            
            return (
              <tr key={r.id} onClick={() => { setSelected(r); }}>
                <td><code style={{ fontSize: '.8rem', color: 'var(--tux-gold)', fontWeight: 700 }}>{r.rentalNo}</code></td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{customerName}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{phone}</div>
                </td>
                <td>
                  <div style={{ fontSize: '.8rem', maxWidth: 160 }}>
                    {r.items && r.items.length > 0 ? r.items[0].productName : 'No items'}
                    {r.items && r.items.length > 1 && <span style={{ color: 'var(--text-muted)' }}> +{r.items.length - 1} more</span>}
                  </div>
                </td>
                <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)', maxWidth: 140 }}>{r.eventName}</td>
                <td style={{ fontSize: '.82rem', whiteSpace: 'nowrap' }}>{fmtDate(r.pickupDate)}</td>
                <td style={{ fontSize: '.82rem', whiteSpace: 'nowrap' }}>
                  {fmtDate(r.returnDate)}
                  {r.status === 'out' && days < 0 && (
                    <div style={{ fontSize: '.7rem', color: 'var(--status-error)', fontWeight: 700 }}>{Math.abs(days)}d overdue</div>
                  )}
                  {r.status === 'out' && days >= 0 && (
                    <div style={{ fontSize: '.7rem', color: 'var(--status-success)' }}>{days}d left</div>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{fmt(r.depositPaid)}</td>
                <td>
                  <span className={`badge ${cfg.cls}`} style={{ textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <SvgIcon name={cfg.icon} width="12" height="12" /> {computedStatus}
                  </span>
                  {r.notes && (
                    <div style={{ fontSize: '.7rem', color: 'var(--status-warning)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
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
            <SvgIcon name="rentals" width="48" height="48" style={{ opacity: 0.3 }} />
          </div>
          <p>No rentals found</p>
        </div>
      )}
    </div>
  );
});
