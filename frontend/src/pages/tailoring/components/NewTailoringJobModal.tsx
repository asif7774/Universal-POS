import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { useCreateTailoringJob, useStaff } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { SearchableSelect } from 'components/atoms/searchable-select/SearchableSelect';

export const NewTailoringJobModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { showSnackbar } = useSnackbar();
  const createJob = useCreateTailoringJob();
  const { data: staffMembers = [] } = useStaff();
  const { data: customers = [] } = useQuery<{ id: string; firstName: string; lastName: string }[]>({
    queryKey: ['customers'],
    queryFn: () => apiClient.get('/customers'),
  });

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
      onError: () => { showSnackbar('Failed to create job', 'error'); },
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <>
          <SvgIcon name="scissors" width="20" height="20" className="text-[var(--accent-gold)]" />
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
      <div className="grid grid-cols-2 gap-[14px]">
        <div className="input-group col-span-full">
          <label className="input-label">Customer *</label>
          <SearchableSelect
            options={customers.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
            value={customers.find(c => `${c.firstName} ${c.lastName}` === form.customerName)?.id ?? ''}
            onChange={id => {
              const c = customers.find(x => x.id === id);
              if (c) {set('customerName', `${c.firstName} ${c.lastName}`);}
            }}
            placeholder="Search and select customer..."
            searchPlaceholder="Type name to search..."
            noOptionsMessage="No customers found"
          />
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
          <SearchableSelect
            options={staffMembers.filter(s => s.isActive).map(s => ({
              value: s.name,
              label: s.name,
              sublabel: s.role,
            }))}
            value={form.assignedToName}
            onChange={v => { set('assignedToName', v); }}
            placeholder="Select staff member..."
            searchPlaceholder="Search staff..."
            noOptionsMessage="No active staff found"
          />
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

        <div className="input-group col-span-full">
          <label className="input-label">Notes</label>
          <textarea className="input resize-y" rows={2} placeholder="Special instructions..."
            value={form.notes} onChange={e => { set('notes', e.target.value); }} />
        </div>
      </div>
    </Modal>
  );
};
