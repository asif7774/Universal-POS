import React from 'react';
import { TailoringJob } from 'types/tailoring';
import { STATUS_COLOR, TYPE_BADGE, fmtDate, fmt, STAGES } from 'constants/tailoring';
import { StatusPipeline } from './StatusPipeline';
import { UseMutationResult } from '@tanstack/react-query';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface TailoringDetailModalProps {
  selected: TailoringJob | null;
  setSelected: (j: TailoringJob | null) => void;
  updateStatus: UseMutationResult<any, Error, { id: string; status: string }>;
}

export const TailoringDetailModal: React.FC<TailoringDetailModalProps> = ({ selected, setSelected, updateStatus }) => {
  if (!selected) {return null;}

  return (
    <Modal
      isOpen={!!selected}
      onClose={() => { setSelected(null); }}
      maxWidth={520}
      title={(
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.jobNo}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span className={`badge ${TYPE_BADGE[selected.type] || 'badge-gray'}`}>{selected.type}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: `${STATUS_COLOR[selected.status] || '#94A3B8'}18`, color: STATUS_COLOR[selected.status] || '#94A3B8', fontSize: '.75rem', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[selected.status] || '#94A3B8' }} />
              {selected.status}
            </span>
          </div>
        </div>
      )}
      footer={
        <>
          <button className="btn btn-outline">Edit Job</button>
          {selected.status !== 'Delivered' && selected.status !== 'Ready' && (
            <button className="btn btn-primary" disabled={updateStatus.isPending} onClick={() => {
              const currentIdx = STAGES.indexOf(selected.status);
              if (currentIdx < STAGES.length - 1) {
                updateStatus.mutate({ id: selected.id, status: STAGES[currentIdx + 1] });
              }
            }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {updateStatus.isPending ? 'Advancing...' : (
                <>
                  Advance Stage <SvgIcon name="chevron-right" width="12" height="12" />
                </>
              )}
            </button>
          )}
          {selected.status === 'Ready' && (
            <button className="btn btn-gold" disabled={updateStatus.isPending} onClick={() => {
              updateStatus.mutate({ id: selected.id, status: 'Delivered' });
            }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {updateStatus.isPending ? 'Marking...' : (
                <>
                  <SvgIcon name="check-circle" width="14" height="14" /> Mark Delivered
                </>
              )}
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); }}>Close</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Progress pipeline */}
        <div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, letterSpacing: '.05em' }}>PROGRESS PIPELINE</div>
          <StatusPipeline current={selected.status} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {STAGES.filter(s => s !== 'Delivered').map(s => (
              <span key={s} style={{ fontSize: '.6rem', color: s === selected.status ? 'var(--tux-navy)' : 'var(--text-muted)', textAlign: 'center', flex: 1, fontWeight: s === selected.status ? 800 : 400 }}>{s}</span>
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
            <div key={i.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: '1px solid var(--surface-border)' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{i.label}</div>
              <div style={{ fontSize: '.875rem', fontWeight: 700 }}>{i.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '12px', border: '1px solid var(--surface-border)' }}>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, letterSpacing: '.05em' }}>WORK DESCRIPTION</div>
          <p style={{ fontSize: '.875rem', margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selected.description || 'No description provided.'}</p>
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
