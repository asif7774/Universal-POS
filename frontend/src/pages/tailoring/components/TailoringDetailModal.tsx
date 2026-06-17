import React, { useState } from 'react';
import { TailoringJob } from 'types/tailoring';
import { STATUS_COLOR, TYPE_BADGE, fmtDate, fmt, STAGES } from 'constants/tailoring';
import { StatusPipeline } from './StatusPipeline';
import { UseMutationResult } from '@tanstack/react-query';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { useUpdateTailoringJob, useStaff } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';

interface TailoringDetailModalProps {
  selected: TailoringJob | null;
  setSelected: (j: TailoringJob | null) => void;
  updateStatus: UseMutationResult<any, Error, { id: string; status: string }>;
}

export const TailoringDetailModal: React.FC<TailoringDetailModalProps> = ({ selected, setSelected, updateStatus }) => {
  const { showSnackbar } = useSnackbar();
  const updateJob = useUpdateTailoringJob();
  const { data: staffMembers = [] } = useStaff();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: '', garment: '', type: '', assignedToName: '', dueDate: '', price: 0, notes: '',
  });

  const startEditing = () => {
    if (!selected) {return;}
    setEditForm({
      customerName: selected.customerName,
      garment: selected.garment,
      type: selected.type,
      assignedToName: selected.assignedToName,
      dueDate: selected.dueDate,
      price: selected.price,
      notes: selected.notes ?? '',
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selected) {return;}
    updateJob.mutate({ id: selected.id, ...editForm }, {
      onSuccess: () => {
        showSnackbar('Job updated!', 'success');
        setIsEditing(false);
        setSelected(null);
      },
      onError: () => { showSnackbar('Failed to update job', 'error'); },
    });
  };

  if (!selected) { return null; }

  return (
    <Modal
      isOpen={!!selected}
      onClose={() => { setSelected(null); setIsEditing(false); }}
      maxWidth={520}
      title={(
        <div>
          <div className="font-['Playfair_Display',serif] text-[1.1rem]">{selected.jobNo}</div>
          <div className="flex gap-1.5 mt-1.5">
            <span className={`badge ${TYPE_BADGE[selected.type] || 'badge-gray'}`}>{selected.type}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[.75rem] font-semibold"
              style={{ background: `${STATUS_COLOR[selected.status] || '#94A3B8'}18`, color: STATUS_COLOR[selected.status] || '#94A3B8' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[selected.status] || '#94A3B8' }} />
              {selected.status}
            </span>
          </div>
        </div>
      )}
      footer={
        isEditing ? (
          <>
            <button className="btn btn-outline" onClick={() => { setIsEditing(false); }}>Cancel</button>
            <button className="btn btn-gold" onClick={saveEdit} disabled={updateJob.isPending}>
              {updateJob.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline inline-flex items-center gap-1.5" onClick={startEditing}>
              <SvgIcon name="tailoring" width="14" height="14" /> Edit Job
            </button>
            {selected.status !== 'Delivered' && selected.status !== 'Ready' && (
              <button className="btn btn-gold flex items-center gap-1.5" disabled={updateStatus.isPending} onClick={() => {
                const currentIdx = STAGES.indexOf(selected.status);
                if (currentIdx < STAGES.length - 1) {
                  updateStatus.mutate({ id: selected.id, status: STAGES[currentIdx + 1] });
                }
              }}>
                {updateStatus.isPending ? 'Advancing...' : (
                  <>
                    Advance Stage <SvgIcon name="chevron-right" width="12" height="12" />
                  </>
                )}
              </button>
            )}
            {selected.status === 'Ready' && (
              <button className="btn btn-gold flex items-center gap-1.5" disabled={updateStatus.isPending} onClick={() => {
                updateStatus.mutate({ id: selected.id, status: 'Delivered' });
              }}>
                {updateStatus.isPending ? 'Marking...' : (
                  <>
                    <SvgIcon name="check-circle" width="14" height="14" /> Mark Delivered
                  </>
                )}
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); }}>Close</button>
          </>
        )
      }
    >
      {isEditing ? (
        <div className="grid grid-cols-2 gap-3.5">
          <div className="input-group col-span-2">
            <label className="input-label">Customer Name</label>
            <input className="input" value={editForm.customerName}
              onChange={e => { setEditForm(f => ({ ...f, customerName: e.target.value })); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Garment</label>
            <input className="input" value={editForm.garment}
              onChange={e => { setEditForm(f => ({ ...f, garment: e.target.value })); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Type</label>
            <select className="input" value={editForm.type}
              onChange={e => { setEditForm(f => ({ ...f, type: e.target.value })); }}>
              {['New Stitch', 'Alteration', 'Repair', 'Hem', 'Custom'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Assigned Staff</label>
            <select className="input" value={editForm.assignedToName}
              onChange={e => { setEditForm(f => ({ ...f, assignedToName: e.target.value })); }}>
              <option value="">Unassigned</option>
              {staffMembers.filter(s => s.isActive).map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Due Date</label>
            <input className="input" type="date" value={editForm.dueDate}
              onChange={e => { setEditForm(f => ({ ...f, dueDate: e.target.value })); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Price ($)</label>
            <input className="input" type="number" step="0.01" value={editForm.price || ''}
              onChange={e => { setEditForm(f => ({ ...f, price: Number(e.target.value) })); }} />
          </div>
          <div className="input-group col-span-2">
            <label className="input-label">Notes</label>
            <textarea className="input resize-y" rows={2} value={editForm.notes}
              onChange={e => { setEditForm(f => ({ ...f, notes: e.target.value })); }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <div>
            <div className="text-[.72rem] text-[var(--text-muted)] font-bold mb-2.5 tracking-[.05em]">PROGRESS PIPELINE</div>
            <StatusPipeline current={selected.status} />
            <div className="flex justify-between mt-1.5">
              {STAGES.filter(s => s !== 'Delivered').map(s => (
                <span key={s} className="text-[.6rem] text-center flex-1"
                  style={{ color: s === selected.status ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: s === selected.status ? 800 : 400 }}>{s}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Customer', value: selected.customerName },
              { label: 'Phone', value: selected.phone || 'N/A' },
              { label: 'Garment', value: selected.garment },
              { label: 'Assigned Tailor', value: selected.assignedToName },
              { label: 'Due Date', value: fmtDate(selected.dueDate) },
              { label: 'Price', value: fmt(selected.price) },
            ].map(i => (
              <div key={i.label} className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] px-3 py-2.5 border border-[var(--border-subtle)]">
                <div className="text-[.7rem] text-[var(--text-muted)] font-semibold mb-1">{i.label}</div>
                <div className="text-[.875rem] font-bold">{i.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] p-3 border border-[var(--border-subtle)]">
            <div className="text-[.72rem] text-[var(--text-muted)] font-bold mb-2 tracking-[.05em]">WORK DESCRIPTION</div>
            <p className="text-[.875rem] m-0 text-[var(--text-primary)] leading-[1.5]">{selected.description || 'No description provided.'}</p>
          </div>

          {selected.notes && (
            <div className="px-3 py-2.5 bg-[#FFFBEB] rounded-[var(--radius-sm)] border border-[#FDE68A] text-[.85rem] text-[#92400E] flex gap-2">
              <SvgIcon name="warning" width="16" height="16" className="mt-0.5" /> {selected.notes}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
