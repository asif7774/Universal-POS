import { Rental } from 'types/rentals';
import { STATUS_CONFIG, fmt, fmtDate, daysLeft } from './RentalTable';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface RentalDetailModalProps {
  selected: Rental | null;
  setSelected: (r: Rental | null) => void;
}

export const RentalDetailModal = ({ selected, setSelected }: RentalDetailModalProps) => {
  if (!selected) {return null;}

  const currentStatus = daysLeft(selected.returnDate) < 0 && selected.status === 'out' ? 'overdue' : selected.status;
  const cfg = STATUS_CONFIG[currentStatus];

  return (
    <Modal
      isOpen={!!selected}
      onClose={() => { setSelected(null); }}
      maxWidth={560}
      title={(
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.rentalNo}</div>
          <span className={`badge ${cfg.cls}`} style={{ marginTop: 6, textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SvgIcon name={cfg.icon} width="12" height="12" /> {currentStatus}
          </span>
        </div>
      )}
      footer={
        <>
          {selected.status === 'out' && <button className="btn btn-primary">Mark as Returned</button>}
          {selected.status === 'booked' && <button className="btn btn-gold">Check Out Items</button>}
          <button className="btn btn-outline" onClick={() => { setSelected(null); }}>Close</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Customer */}
        <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '12px 14px', border: '1px solid var(--surface-border)' }}>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, letterSpacing: '.05em' }}>CUSTOMER</div>
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{selected.customer ? `${selected.customer.firstName} ${selected.customer.lastName}` : 'Unknown'}</div>
          <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{selected.customer?.phone}</div>
        </div>

        {/* Event */}
        <div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700, letterSpacing: '.05em' }}>EVENT</div>
          <div style={{ fontSize: '.9rem', color: 'var(--text-primary)' }}>{selected.eventName || 'N/A'}</div>
        </div>

        {/* Items */}
        <div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, letterSpacing: '.05em' }}>RENTED ITEMS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selected.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                <SvgIcon name="inventory" width="14" height="14" style={{ color: 'var(--tux-navy)', opacity: 0.7 }} />
                <span style={{ fontSize: '.875rem', fontWeight: 500 }}>{item.productName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dates + Financials */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Pickup Date', value: fmtDate(selected.pickupDate) },
            { label: 'Return Date', value: fmtDate(selected.returnDate) },
            { label: 'Deposit Paid', value: fmt(selected.depositPaid) },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: '.92rem', fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {selected.notes && (
          <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E', display: 'flex', gap: 8 }}>
            <SvgIcon name="warning" width="16" height="16" style={{ marginTop: 2 }} /> {selected.notes}
          </div>
        )}
      </div>
    </Modal>
  );
};
