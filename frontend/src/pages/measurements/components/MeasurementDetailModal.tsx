import React, { useState } from 'react';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { MeasurementRecord } from 'types/measurements';
import { useUpdateMeasurement, useDeleteMeasurement } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { FIELDS, fmtDate } from 'constants/measurements';

interface MeasurementDetailModalProps {
  selected: MeasurementRecord | null;
  setSelected: (r: MeasurementRecord | null) => void;
}

export const MeasurementDetailModal: React.FC<MeasurementDetailModalProps> = ({ selected, setSelected }) => {
  const { showSnackbar } = useSnackbar();
  const updateMeasurement = useUpdateMeasurement();
  const deleteMeasurement = useDeleteMeasurement();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const startEditing = () => {
    if (!selected) return;
    const form: Record<string, string> = {};
    FIELDS.forEach(f => { form[f.key] = String(selected[f.key] ?? ''); });
    form.notes = selected.notes ?? '';
    form.fittingNotes = selected.fittingNotes ?? '';
    setEditForm(form);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selected) return;
    updateMeasurement.mutate(
      { customerId: selected.customerId, measurementId: selected.id, ...editForm },
      {
        onSuccess: () => {
          showSnackbar('Measurements updated!', 'success');
          setIsEditing(false);
          setSelected(null);
        },
        onError: () => showSnackbar('Failed to update measurements', 'error'),
      }
    );
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteMeasurement.mutate(
      { customerId: selected.customerId, measurementId: selected.id },
      {
        onSuccess: () => {
          showSnackbar('Measurement record deleted', 'success');
          setShowDeleteConfirm(false);
          setSelected(null);
        },
        onError: () => showSnackbar('Failed to delete measurement', 'error'),
      }
    );
  };

  const footerContent = () => {
    if (showDeleteConfirm) {
      return (
        <>
          <span style={{ fontSize: '.85rem', color: 'var(--status-error)', fontWeight: 600 }}>Delete this measurement record?</span>
          <button className="btn btn-outline" onClick={() => { setShowDeleteConfirm(false); }}>Cancel</button>
          <button className="btn" style={{ background: 'var(--status-error)', color: 'white' }}
            onClick={handleDelete} disabled={deleteMeasurement.isPending}>
            {deleteMeasurement.isPending ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </>
      );
    }
    if (isEditing) {
      return (
        <>
          <button className="btn btn-outline" onClick={() => { setIsEditing(false); }}>Cancel</button>
          <button className="btn btn-gold" onClick={saveEdit} disabled={updateMeasurement.isPending}>
            {updateMeasurement.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      );
    }
    return (
      <>
        <button className="btn btn-outline" onClick={startEditing} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <SvgIcon name="tailoring" width="14" height="14" /> Edit
        </button>
        <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => { window.print(); }}>
          <SvgIcon name="printer" width="14" height="14" /> Print Card
        </button>
        <button className="btn btn-ghost btn-sm text-[var(--status-error)]" onClick={() => { setShowDeleteConfirm(true); }}>Delete</button>
      </>
    );
  };

  return (
    <Modal
      isOpen={!!selected}
      onClose={() => { setSelected(null); setIsEditing(false); setShowDeleteConfirm(false); }}
      maxWidth={560}
      title={isEditing ? `Edit — ${selected?.customerName}` : selected?.customerName}
      footer={footerContent()}
    >
      {selected && (
        isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              {FIELDS.map(f => (
                <div key={f.key} className="input-group">
                  <label className="input-label">{f.label}</label>
                  <input className="input" value={editForm[f.key] ?? ''}
                    onChange={e => { setEditForm(form => ({ ...form, [f.key]: e.target.value })); }} />
                </div>
              ))}
            </div>
            <div className="input-group">
              <label className="input-label">Tailor Notes</label>
              <textarea className="input" rows={2} value={editForm.notes ?? ''}
                onChange={e => { setEditForm(form => ({ ...form, notes: e.target.value })); }}
                style={{ resize: 'vertical' }} />
            </div>
            <div className="input-group">
              <label className="input-label">Fitting Notes</label>
              <textarea className="input" rows={2} value={editForm.fittingNotes ?? ''}
                onChange={e => { setEditForm(form => ({ ...form, fittingNotes: e.target.value })); }}
                style={{ resize: 'vertical' }} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: -16, marginBottom: 16 }}>
              Measured {fmtDate(selected.date)} · by {selected.takenBy}
            </div>
            {/* Measurement grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              {FIELDS.filter(f => selected[f.key]).map(f => (
                <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--surface-border)', fontSize: '.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                  <span style={{ fontWeight: 700 }}>{String(selected[f.key])}</span>
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
        )
      )}
    </Modal>
  );
};
