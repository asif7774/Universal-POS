import React from 'react';
import { TailoringJob } from 'types/tailoring';
import { STATUS_COLOR, TYPE_BADGE, fmtDate, fmt, STAGES } from 'constants/tailoring';
import { StatusPipeline } from './StatusPipeline';
import { UseMutationResult } from '@tanstack/react-query';

interface TailoringDetailModalProps {
  selected: TailoringJob | null;
  setSelected: (j: TailoringJob | null) => void;
  updateStatus: UseMutationResult<any, Error, { id: string; status: string }, unknown>;
}

export const TailoringDetailModal: React.FC<TailoringDetailModalProps> = ({ selected, setSelected, updateStatus }) => {
  if (!selected) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelected(null)}>
      <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.jobNo}</h3>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <span className={`badge ${TYPE_BADGE[selected.type] || 'badge-gray'}`}>{selected.type}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: `${STATUS_COLOR[selected.status] || '#94A3B8'}18`, color: STATUS_COLOR[selected.status] || '#94A3B8', fontSize: '.75rem', fontWeight: 600 }}>
                {selected.status}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Progress pipeline */}
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>PROGRESS</div>
            <StatusPipeline current={selected.status} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {STAGES.filter(s => s !== 'Delivered').map(s => (
                <span key={s} style={{ fontSize: '.6rem', color: 'var(--text-muted)', textAlign: 'center', flex: 1 }}>{s === selected.status ? <strong>{s}</strong> : s}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Customer', value: selected.customerName },
              { label: 'Phone', value: selected.phone || 'N/A' },
              { label: 'Garment', value: selected.garment },
              { label: 'Assigned Tailor', value: selected.assignedToName },
              { label: 'Due Date', value: fmtDate(selected.dueDate) },
              { label: 'Price', value: fmt(selected.price) },
            ].map(i => (
              <div key={i.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>{i.label}</div>
                <div style={{ fontSize: '.875rem', fontWeight: 700 }}>{i.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>WORK DESCRIPTION</div>
            <p style={{ fontSize: '.875rem', margin: 0 }}>{selected.description || 'No description provided.'}</p>
          </div>

          {selected.notes && (
            <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E' }}>
              ⚠️ {selected.notes}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline">Edit Job</button>
          {selected.status !== 'Delivered' && selected.status !== 'Ready' && (
            <button className="btn btn-primary" disabled={updateStatus.isPending} onClick={() => {
              const currentIdx = STAGES.indexOf(selected.status);
              if (currentIdx < STAGES.length - 1) {
                updateStatus.mutate({ id: selected.id, status: STAGES[currentIdx + 1] });
              }
            }}>
              {updateStatus.isPending ? 'Advancing...' : '→ Advance Stage'}
            </button>
          )}
          {selected.status === 'Ready' && (
            <button className="btn btn-gold" disabled={updateStatus.isPending} onClick={() => {
              updateStatus.mutate({ id: selected.id, status: 'Delivered' });
            }}>
              {updateStatus.isPending ? 'Marking...' : '✓ Mark Delivered'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
