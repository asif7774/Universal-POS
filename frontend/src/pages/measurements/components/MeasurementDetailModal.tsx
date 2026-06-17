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
    if (!selected) {return;}
    const form: Record<string, string> = {};
    FIELDS.forEach(f => { form[f.key] = String(selected[f.key] ?? ''); });
    form.notes = selected.notes ?? '';
    form.fittingNotes = selected.fittingNotes ?? '';
    setEditForm(form);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selected) {return;}
    updateMeasurement.mutate(
      { customerId: selected.customerId, measurementId: selected.id, ...editForm },
      {
        onSuccess: () => {
          showSnackbar('Measurements updated!', 'success');
          setIsEditing(false);
          setSelected(null);
        },
        onError: () => { showSnackbar('Failed to update measurements', 'error'); },
      }
    );
  };

  const handleDelete = () => {
    if (!selected) {return;}
    deleteMeasurement.mutate(
      { customerId: selected.customerId, measurementId: selected.id },
      {
        onSuccess: () => {
          showSnackbar('Measurement record deleted', 'success');
          setShowDeleteConfirm(false);
          setSelected(null);
        },
        onError: () => { showSnackbar('Failed to delete measurement', 'error'); },
      }
    );
  };

  const footerContent = () => {
    if (showDeleteConfirm) {
      return (
        <>
          <span className="text-[.85rem] text-[var(--status-error)] font-semibold">Delete this measurement record?</span>
          <button className="btn btn-outline" onClick={() => { setShowDeleteConfirm(false); }}>Cancel</button>
          <button className="btn btn-danger"
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
        <button className="btn btn-outline inline-flex items-center gap-1.5" onClick={startEditing}>
          <SvgIcon name="tailoring" width="14" height="14" /> Edit
        </button>
        <button className="btn btn-gold inline-flex items-center gap-1.5"
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
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
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
              <textarea className="input resize-y" rows={2} value={editForm.notes ?? ''}
                onChange={e => { setEditForm(form => ({ ...form, notes: e.target.value })); }} />
            </div>
            <div className="input-group">
              <label className="input-label">Fitting Notes</label>
              <textarea className="input resize-y" rows={2} value={editForm.fittingNotes ?? ''}
                onChange={e => { setEditForm(form => ({ ...form, fittingNotes: e.target.value })); }} />
            </div>
          </div>
        ) : (
          <>
            <div className="text-[.8rem] text-[var(--text-muted)] -mt-4 mb-4">
              Measured {fmtDate(selected.date)} · by {selected.takenBy}
            </div>
            {/* Measurement grid */}
            <div className="grid grid-cols-2 gap-x-8">
              {FIELDS.filter(f => selected[f.key]).map(f => (
                <div key={f.key} className="flex justify-between py-2 border-b border-[var(--border-subtle)] text-[.875rem]">
                  <span className="text-[var(--text-secondary)]">{f.label}</span>
                  <span className="font-bold">{String(selected[f.key])}</span>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="mt-4 px-3 py-2.5 bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] text-[.85rem]">
                <div className="font-semibold mb-1 text-[var(--text-secondary)] text-[.75rem] uppercase">Tailor Notes</div>
                {selected.notes}
              </div>
            )}
            {selected.fittingNotes && (
              <div className="mt-2.5 px-3 py-2.5 bg-[#FDF8E7] border border-[#FDE68A] rounded-[var(--radius-sm)] text-[.85rem] text-[#92400E]">
                <div className="font-semibold mb-1 text-[.75rem] uppercase">Fitting Notes</div>
                {selected.fittingNotes}
              </div>
            )}
          </>
        )
      )}
    </Modal>
  );
};
