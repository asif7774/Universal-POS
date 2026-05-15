import React from 'react';
import { Rental } from '../types';
import { STATUS_CONFIG, fmt, fmtDate, daysLeft } from './RentalTable';

interface RentalDetailModalProps {
  selected: Rental | null;
  setSelected: (r: Rental | null) => void;
}

export const RentalDetailModal = ({ selected, setSelected }: RentalDetailModalProps) => {
  if (!selected) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelected(null)}>
      <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.rentalNo}</h3>
            <span className={`badge ${STATUS_CONFIG[daysLeft(selected.returnDate) < 0 && selected.status === 'out' ? 'overdue' : selected.status].cls}`} style={{ marginTop: 4, textTransform: 'capitalize' }}>
              {STATUS_CONFIG[daysLeft(selected.returnDate) < 0 && selected.status === 'out' ? 'overdue' : selected.status].icon} {daysLeft(selected.returnDate) < 0 && selected.status === 'out' ? 'overdue' : selected.status}
            </span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Customer */}
          <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>CUSTOMER</div>
            <div style={{ fontWeight: 700 }}>{selected.customer ? `${selected.customer.firstName} ${selected.customer.lastName}` : 'Unknown'}</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{selected.customer?.phone}</div>
          </div>

          {/* Event */}
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>EVENT</div>
            <div style={{ fontSize: '.9rem' }}>{selected.eventName || 'N/A'}</div>
          </div>

          {/* Items */}
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>RENTED ITEMS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                  <span>🎩</span>
                  <span style={{ fontSize: '.875rem' }}>{item.productName}</span>
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
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '.95rem', fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {selected.notes && (
            <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E' }}>
              ⚠️ {selected.notes}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {selected.status === 'out' && <button className="btn btn-primary">Mark as Returned</button>}
          {selected.status === 'booked' && <button className="btn btn-gold">Check Out Items</button>}
          <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
        </div>
      </div>
    </div>
  );
};
