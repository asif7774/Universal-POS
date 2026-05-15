import React from 'react';
import { STAFF, ROLE_BADGE } from 'constants/settings';

export const StaffTab: React.FC = () => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)' }}>
      <span className="card-title">👥 Staff Members</span>
      <button className="btn btn-gold btn-sm">+ Add Staff</button>
    </div>
    <table className="data-table">
      <thead>
        <tr><th>Name</th><th>Email</th><th>Role</th><th>PIN</th><th>Last Login</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        {STAFF.map(s => (
          <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.5 }}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar" style={{ width: 30, height: 30, fontSize: '.7rem', background: s.role === 'owner' ? 'var(--tux-gold)' : 'var(--tux-navy)' }}>
                  {s.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{s.name}</span>
              </div>
            </td>
            <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{s.email}</td>
            <td><span className={`badge ${ROLE_BADGE[s.role]}`} style={{ textTransform: 'capitalize' }}>{s.role}</span></td>
            <td style={{ fontFamily: 'monospace', fontSize: '.85rem' }}>{s.pin ?? '—'}</td>
            <td style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{s.lastLogin}</td>
            <td>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 600,
                color: s.isActive ? 'var(--status-success)' : 'var(--text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.isActive ? 'var(--status-success)' : '#94A3B8' }} />
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>
              <button className="btn btn-outline btn-sm">Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
