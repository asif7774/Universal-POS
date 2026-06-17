import React, { useState } from 'react';
import { useCreateTenant } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const NewTenantModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { showSnackbar } = useSnackbar();
  const createTenant = useCreateTenant();

  const [form, setForm] = useState({ name: '', domain: '', status: 'active' });
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); };

  const handleSubmit = () => {
    if (!form.name || !form.domain) {
      showSnackbar('Name and domain are required', 'error');
      return;
    }
    createTenant.mutate(form, {
      onSuccess: () => {
        showSnackbar('Tenant created successfully!', 'success');
        onClose();
      },
      onError: () => { showSnackbar('Failed to create tenant', 'error'); },
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <>
          <SvgIcon name="building" width="20" height="20" className="text-[var(--accent-gold)]" />
          New Tenant
        </>
      }
      maxWidth={440}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={createTenant.isPending}>Cancel</button>
          <button className="btn btn-navy" onClick={handleSubmit} disabled={createTenant.isPending}>
            {createTenant.isPending ? 'Creating...' : 'Create Tenant'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-[14px]">
        <div className="input-group">
          <label className="input-label">Business Name *</label>
          <input className="input" placeholder="e.g. Prestige Formalwear" value={form.name}
            onChange={e => { set('name', e.target.value); }} />
        </div>
        <div className="input-group">
          <label className="input-label">Domain *</label>
          <input className="input" placeholder="e.g. prestige" value={form.domain}
            onChange={e => { set('domain', e.target.value); }} />
          <span className="text-[.72rem] text-[var(--text-muted)] mt-1">
            Will be accessible at {form.domain || '___'}.tuxedopos.com
          </span>
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <select className="input" value={form.status} onChange={e => { set('status', e.target.value); }}>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};
