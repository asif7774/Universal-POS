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
  const cfg = STATUS_CONFIG[currentStatus] || { cls: 'badge-gray', icon: 'help-circle' };

  return (
    <Modal
      isOpen={!!selected}
      onClose={() => { setSelected(null); }}
      maxWidth={560}
      title={(
        <div>
          <div className="font-[family-name:'Playfair_Display',serif] text-[1.1rem]">{selected.rentalNo}</div>
          <span className={`badge ${cfg.cls} mt-[6px] capitalize inline-flex items-center gap-[6px]`}>
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
      <div className="flex flex-col gap-4">
        {/* Customer */}
        <div className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-md)] px-[14px] py-[12px] border border-[var(--border-subtle)]">
          <div className="text-[.72rem] text-[var(--text-muted)] mb-[6px] font-bold tracking-[.05em]">CUSTOMER</div>
          <div className="font-bold text-[.95rem]">{selected.customer ? `${selected.customer.firstName} ${selected.customer.lastName}` : 'Unknown'}</div>
          <div className="text-[.85rem] text-[var(--text-secondary)]">{selected.customer?.phone}</div>
        </div>

        {/* Event */}
        <div>
          <div className="text-[.72rem] text-[var(--text-muted)] mb-1 font-bold tracking-[.05em]">EVENT</div>
          <div className="text-[.9rem] text-[var(--text-primary)]">{selected.eventName || 'N/A'}</div>
        </div>

        {/* Items */}
        <div>
          <div className="text-[.72rem] text-[var(--text-muted)] mb-2 font-bold tracking-[.05em]">RENTED ITEMS</div>
          <div className="flex flex-col gap-[6px]">
            {selected.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-[10px] px-[12px] py-[10px] bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
                <SvgIcon name="inventory" width="14" height="14" className="text-[var(--text-primary)] opacity-70" />
                <span className="text-[.875rem] font-medium">{item.productName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dates + Financials */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Pickup Date', value: fmtDate(selected.pickupDate) },
            { label: 'Return Date', value: fmtDate(selected.returnDate) },
            { label: 'Deposit Paid', value: fmt(selected.depositPaid) },
          ].map(item => (
            <div key={item.label} className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] px-[12px] py-[10px]">
              <div className="text-[.7rem] text-[var(--text-muted)] font-semibold mb-1">{item.label}</div>
              <div className="text-[.92rem] font-bold">{item.value}</div>
            </div>
          ))}
        </div>

        {showCheckinForm && (
          <div className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-md)] p-[14px] border border-[var(--border-subtle)] flex flex-col gap-3">
            <div className="text-[.75rem] font-bold text-[var(--text-muted)] tracking-[.05em]">RETURN DETAILS</div>
            <div>
              <label className="label text-[.78rem]">Condition</label>
              <select className="input" value={checkinCondition} onChange={e => { setCheckinCondition(e.target.value); }}>
                <option value="good">Good — no issues</option>
                <option value="minor">Minor — small wear or stain</option>
                <option value="damaged">Damaged — repair needed</option>
              </select>
            </div>
            <div>
              <label className="label text-[.78rem]">Damage Fee ($)</label>
              <input className="input" type="number" min="0" step="0.01" value={damageFee}
                onChange={e => { setDamageFee(e.target.value); }} />
            </div>
          </div>
        )}

        {selected.notes && (
          <div className="px-[12px] py-[10px] bg-[#FFFBEB] rounded-[var(--radius-sm)] border border-[#FDE68A] text-[.85rem] text-[#92400E] flex gap-2">
            <SvgIcon name="warning" width="16" height="16" className="mt-[2px]" /> {selected.notes}
          </div>
        )}
      </div>
    </Modal>
  );
};
