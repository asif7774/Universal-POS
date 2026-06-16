import React, { useState } from 'react';
import { useStaff, useCreateStaff } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

const ROLE_BADGE: Record<string, string> = {
  owner:   'badge-gold',
  manager: 'badge-emerald',
  cashier: 'badge-neutral',
  staff:   'badge-neutral',
};

const EMPTY_FORM = { name: '', email: '', role: 'cashier' as 'owner' | 'manager' | 'cashier', pin: '' };

export const StaffTab: React.FC = () => {
  const { data: staff = [], isLoading } = useStaff();
  const createStaff = useCreateStaff();
  const { showSnackbar } = useSnackbar();

  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) {
      showSnackbar('Name and email are required.', 'error');
      return;
    }
    createStaff.mutate(
      { name: form.name.trim(), email: form.email.trim(), role: form.role, pin: form.pin || undefined },
      {
        onSuccess: () => {
          showSnackbar('Staff member added.', 'success');
          setForm(EMPTY_FORM);
          setIsAdding(false);
        },
        onError: () => showSnackbar('Failed to add staff member.', 'error'),
      }
    );
  };

  const handleClose = () => { setForm(EMPTY_FORM); setIsAdding(false); };

  return (
    <>
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="panel-header" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SvgIcon name="users" width="18" height="18" style={{ color: 'var(--accent-gold-text)' }} />
            Staff Members
          </span>
          <button className="btn btn-gold btn-sm" onClick={() => setIsAdding(true)}>+ Add Staff</button>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-[var(--text-muted)]">Loading staff...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>PIN</th>
                <th>Last Login</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} className="table-row" style={{ opacity: s.isActive ? 1 : 0.5 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: '.7rem', background: s.role === 'owner' ? 'var(--accent-gold)' : 'var(--bg-panel-hover)' }}>
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--text-primary)' }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td>
                    <span className={`badge ${ROLE_BADGE[s.role] ?? 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>{s.role}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '.85rem', color: 'var(--text-secondary)' }}>{s.pin ?? '—'}</td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{s.lastLogin}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 600,
                      color: s.isActive ? 'var(--accent-emerald-text)' : 'var(--text-muted)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.isActive ? 'var(--accent-emerald-text)' : 'var(--text-muted)' }} />
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm">Edit</button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-[var(--text-muted)]">No staff members found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isAdding && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Staff Member</h2>
              <button className="btn btn-ghost btn-sm" onClick={handleClose}>
                <SvgIcon name="close" width="16" height="16" />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Name <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <input className="input" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Email <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <input className="input" type="email" placeholder="staff@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div>
                <label className="label">PIN <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input className="input" placeholder="4-digit PIN" maxLength={4} value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-outline" onClick={handleClose}>Cancel</button>
              <button className="btn btn-gold" onClick={handleAdd} disabled={createStaff.isPending}>
                {createStaff.isPending ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
