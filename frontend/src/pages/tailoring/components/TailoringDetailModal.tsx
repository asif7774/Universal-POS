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
    if (!selected) return;
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
    if (!selected) return;
    updateJob.mutate({ id: selected.id, ...editForm }, {
      onSuccess: () => {
        showSnackbar('Job updated!', 'success');
        setIsEditing(false);
        setSelected(null);
      },
      onError: () => showSnackbar('Failed to update job', 'error'),
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
        isEditing ? (
          <>
            <button className="btn btn-outline" onClick={() => { setIsEditing(false); }}>Cancel</button>
            <button className="btn btn-gold" onClick={saveEdit} disabled={updateJob.isPending}>
              {updateJob.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={startEditing} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <SvgIcon name="tailoring" width="14" height="14" /> Edit Job
            </button>
            {selected.status !== 'Delivered' && selected.status !== 'Ready' && (
              <button className="btn btn-gold" disabled={updateStatus.isPending} onClick={() => {
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
        )
      }
    >
      {isEditing ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
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
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Notes</label>
            <textarea className="input" rows={2} value={editForm.notes}
              onChange={e => { setEditForm(f => ({ ...f, notes: e.target.value })); }}
              style={{ resize: 'vertical' }} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, letterSpacing: '.05em' }}>PROGRESS PIPELINE</div>
            <StatusPipeline current={selected.status} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {STAGES.filter(s => s !== 'Delivered').map(s => (
                <span key={s} style={{ fontSize: '.6rem', color: s === selected.status ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center', flex: 1, fontWeight: s === selected.status ? 800 : 400 }}>{s}</span>
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
              <div key={i.label} style={{ background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{i.label}</div>
                <div style={{ fontSize: '.875rem', fontWeight: 700 }}>{i.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-sm)', padding: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, letterSpacing: '.05em' }}>WORK DESCRIPTION</div>
            <p style={{ fontSize: '.875rem', margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selected.description || 'No description provided.'}</p>
          </div>

          {selected.notes && (
            <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E', display: 'flex', gap: 8 }}>
              <SvgIcon name="warning" width="16" height="16" style={{ marginTop: 2 }} /> {selected.notes}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
