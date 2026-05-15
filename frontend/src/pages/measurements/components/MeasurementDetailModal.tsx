import React from 'react';
import { Modal } from 'components/atoms/modal/Modal';
import { MeasurementRecord } from '../types';
import { FIELDS, fmtDate } from '../constants';

interface MeasurementDetailModalProps {
  selected: MeasurementRecord | null;
  setSelected: (r: MeasurementRecord | null) => void;
}

export const MeasurementDetailModal: React.FC<MeasurementDetailModalProps> = ({ selected, setSelected }) => {
  return (
    <Modal
      isOpen={!!selected}
      onClose={() => setSelected(null)}
      maxWidth={560}
      title={selected?.customerName}
      footer={
        <>
          <button className="btn btn-outline">✏️ Edit</button>
          <button className="btn btn-primary">🖨️ Print Card</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
        </>
      }
    >
      {selected && (
        <>
          <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: -16, marginBottom: 16 }}>
            Measured {fmtDate(selected.date)} · by {selected.takenBy}
          </div>
          {/* Measurement grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
            {FIELDS.filter(f => selected[f.key as keyof MeasurementRecord]).map(f => (
              <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--surface-border)', fontSize: '.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                <span style={{ fontWeight: 700 }}>{String(selected[f.key as keyof MeasurementRecord])}</span>
              </div>
            ))}
          </div>
          {selected.notes && (
            <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '.85rem' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)', fontSize: '.75rem', textTransform: 'uppercase' }}>Tailor Notes</div>
              {selected.notes}
            </div>
          )}
          {selected.fittingNotes && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#FDF8E7', border: '1px solid #FDE68A', borderRadius: 'var(--radius-sm)', fontSize: '.85rem', color: '#92400E' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '.75rem', textTransform: 'uppercase' }}>Fitting Notes</div>
              {selected.fittingNotes}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};
