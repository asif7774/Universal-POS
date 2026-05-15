import React from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { Appointment } from 'types/appointments';
import { TYPE_CONFIG, STATUS_CONFIG, fmtDay } from 'constants/appointments';

interface AppointmentDetailModalProps {
  selected: Appointment | null;
  setSelected: (a: Appointment | null) => void;
  updateMutation: UseMutationResult<any, Error, { id: string; status: string }, unknown>;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ selected, setSelected, updateMutation }) => {
  if (!selected) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelected(null)}>
      <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.2rem' }}>{TYPE_CONFIG[selected.type].icon}</span>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.type} — {selected.customer}</h3>
            </div>
            <span className={`badge ${STATUS_CONFIG[selected.status].cls}`}>{selected.status}</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Date', value: `${fmtDay(selected.date).weekday}, ${fmtDay(selected.date).month} ${fmtDay(selected.date).day}` },
              { label: 'Time', value: `${selected.time} (${selected.duration} min)` },
              { label: 'Phone', value: selected.phone },
              { label: 'Assigned To', value: selected.assignedTo },
              ...(selected.orderId ? [{ label: 'Linked Order', value: selected.orderId }] : []),
            ].map(i => (
              <div key={i.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>{i.label}</div>
                <div style={{ fontSize: '.875rem', fontWeight: 700 }}>{i.value}</div>
              </div>
            ))}
          </div>
          {selected.notes && (
            <div style={{ padding: '10px 12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-sm)', fontSize: '.85rem', color: '#92400E' }}>
              📝 {selected.notes}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {selected.status === 'Scheduled' && <button className="btn btn-primary" onClick={() => updateMutation.mutate({ id: selected.id, status: 'Confirmed' })}>✓ Confirm</button>}
          {selected.status === 'Confirmed' && <button className="btn btn-gold" onClick={() => updateMutation.mutate({ id: selected.id, status: 'Completed' })}>✓ Mark Complete</button>}
          {!['Cancelled','Completed','No-Show'].includes(selected.status) && <button className="btn btn-danger btn-sm" onClick={() => updateMutation.mutate({ id: selected.id, status: 'Cancelled' })}>Cancel</button>}
          <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
        </div>
      </div>
    </div>
  );
};
