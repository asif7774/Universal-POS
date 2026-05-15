import React, { useState } from 'react';
import { useCreateTailoringJob, useStaff } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const NewTailoringJobModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { showSnackbar } = useSnackbar();
  const createJob = useCreateTailoringJob();
  const { data: staffMembers = [] } = useStaff();

  const [form, setForm] = useState({
    customerName: '',
    garment: '',
    type: 'New Stitch',
    assignedToName: '',
    dueDate: '',
    price: 0,
    notes: '',
  });

  const set = (k: string, v: string | number) => {
    setForm(f => ({ ...f, [k]: v }));
  };

  const handleSubmit = () => {
    if (!form.customerName || !form.garment || !form.dueDate) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }
    createJob.mutate(form, {
      onSuccess: () => {
        showSnackbar('Tailoring job created!', 'success');
        onClose();
      },
      onError: () => showSnackbar('Failed to create job', 'error'),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <>
          <SvgIcon name="scissors" width="20" height="20" style={{ color: 'var(--tux-gold)' }} />
          New Tailoring Job
        </>
      }
      maxWidth={520}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={createJob.isPending}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSubmit} disabled={createJob.isPending}>
            {createJob.isPending ? 'Creating...' : 'Create Job'}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Customer Name *</label>
          <input className="input" placeholder="John Smith" value={form.customerName}
            onChange={e => { set('customerName', e.target.value); }} />
        </div>

        <div className="input-group">
          <label className="input-label">Garment *</label>
          <input className="input" placeholder="e.g. 3-Piece Suit" value={form.garment}
            onChange={e => { set('garment', e.target.value); }} />
        </div>

        <div className="input-group">
          <label className="input-label">Type</label>
          <select className="input" value={form.type} onChange={e => { set('type', e.target.value); }}>
            {['New Stitch', 'Alteration', 'Repair', 'Hem', 'Custom'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Assigned Staff</label>
          <select className="input" value={form.assignedToName} onChange={e => { set('assignedToName', e.target.value); }}>
            <option value="" disabled>Select staff...</option>
            {staffMembers.filter(s => s.isActive).map(s => (
              <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Due Date *</label>
          <input className="input" type="date" value={form.dueDate}
            onChange={e => { set('dueDate', e.target.value); }} />
        </div>

        <div className="input-group">
          <label className="input-label">Price ($)</label>
          <input className="input" type="number" step="0.01" placeholder="0.00" value={form.price || ''}
            onChange={e => { set('price', Number(e.target.value)); }} />
        </div>

        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Notes</label>
          <textarea className="input" rows={2} placeholder="Special instructions..."
            value={form.notes} onChange={e => { set('notes', e.target.value); }}
            style={{ resize: 'vertical' }} />
        </div>
      </div>
    </Modal>
  );
};
