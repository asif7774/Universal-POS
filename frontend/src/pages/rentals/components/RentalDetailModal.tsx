import { useState } from 'react';
import { Rental } from 'types/rentals';
import { STATUS_CONFIG, fmt, fmtDate, daysLeft } from './RentalTable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface RentalDetailModalProps {
  selected: Rental | null;
  setSelected: (r: Rental | null) => void;
}

export const RentalDetailModal = ({ selected, setSelected }: RentalDetailModalProps) => {
  const queryClient = useQueryClient();
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [checkinCondition, setCheckinCondition] = useState('good');
  const [damageFee, setDamageFee] = useState('0');

  const checkout = useMutation({
    mutationFn: () => apiClient.patch(`/rentals/${selected?.id}/checkout`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setSelected(null);
    }
  });

  const checkin = useMutation({
    mutationFn: () => apiClient.patch(`/rentals/${selected?.id}/checkin`, {
      condition: checkinCondition,
      damageFee: parseFloat(damageFee) || 0,
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setShowCheckinForm(false);
      setSelected(null);
    }
  });

  if (!selected) {return null;}

  const currentStatus = daysLeft(selected.returnDate) < 0 && selected.status === 'out' ? 'overdue' : selected.status;
  const cfg = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] || { cls: 'badge-gray', icon: 'help-circle' };

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
          {selected.status === 'out' && !showCheckinForm && (
            <button className="btn btn-gold" onClick={() => { setShowCheckinForm(true); }}>
              Mark as Returned
            </button>
          )}
          {selected.status === 'out' && showCheckinForm && (
            <>
              <button className="btn btn-outline" onClick={() => { setShowCheckinForm(false); }}>Cancel</button>
              <button
                className="btn btn-gold"
                onClick={() => { checkin.mutate(); }}
                disabled={checkin.isPending}
              >
                {checkin.isPending ? 'Processing...' : 'Confirm Return'}
              </button>
            </>
          )}
          {selected.status === 'booked' && (
            <button
              className="btn btn-gold"
              onClick={() => { checkout.mutate(); }}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? 'Checking Out...' : 'Check Out Items'}
            </button>
          )}
          <button className="btn btn-outline" onClick={() => { setSelected(null); setShowCheckinForm(false); }}>Close</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Customer */}
        <div style={{ background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-md)', padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
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
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <SvgIcon name="inventory" width="14" height="14" style={{ color: 'var(--text-primary)', opacity: 0.7 }} />
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
            <div key={item.label} style={{ background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: '.92rem', fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {showCheckinForm && (
          <div style={{ background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.05em' }}>RETURN DETAILS</div>
            <div>
              <label className="label" style={{ fontSize: '.78rem' }}>Condition</label>
              <select className="input" value={checkinCondition} onChange={e => { setCheckinCondition(e.target.value); }}>
                <option value="good">Good — no issues</option>
                <option value="minor">Minor — small wear or stain</option>
                <option value="damaged">Damaged — repair needed</option>
              </select>
            </div>
            <div>
              <label className="label" style={{ fontSize: '.78rem' }}>Damage Fee ($)</label>
              <input className="input" type="number" min="0" step="0.01" value={damageFee}
                onChange={e => { setDamageFee(e.target.value); }} />
            </div>
          </div>
        )}

        {selected.notes && (
          <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E', display: 'flex', gap: 8 }}>
            <SvgIcon name="warning" width="16" height="16" style={{ marginTop: 2 }} /> {selected.notes}
          </div>
        )}
      </div>
    </Modal>
  );
};
