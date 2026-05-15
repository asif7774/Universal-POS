import React, { useState } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const MOCK_TENANTS = [
  { id: 't1', name: 'TuxedoPOS HQ', domain: 'tuxedo', status: 'active', users: 4, revenue: 15400, created: '2025-10-12' },
  { id: 't2', name: 'Marios Pizzeria', domain: 'restaurant', status: 'active', users: 12, revenue: 32100, created: '2026-01-05' },
  { id: 't3', name: 'Bella Salon', domain: 'salon', status: 'onboarding', users: 2, revenue: 0, created: '2026-05-10' },
  { id: 't4', name: 'QuickMart', domain: 'grocery', status: 'suspended', users: 5, revenue: 4200, created: '2025-11-20' },
];

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  // Quick hack: Assume only the specific 'admin@tuxedopos.com' is super admin for now.
  // In reality, you'd check a 'isSuperAdmin' flag on the JWT token.
  if (user?.email !== 'admin@tuxedopos.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Admin</h1>
          <p className="page-subtitle">Global oversight and tenant management</p>
        </div>
        <button className="btn btn-navy">+ New Tenant</button>
      </div>

      {/* Global Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Total Tenants', value: '4' },
          { label: 'Active Terminals', value: '23' },
          { label: 'MRR', value: '$8,450' },
          { label: 'Sys Health', value: '99.9%', ok: true },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.ok ? 'var(--status-success)' : 'var(--text-primary)', marginTop: 4 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tenant List */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="card-title">All Tenants</span>
          <input 
            type="text" 
            className="input" 
            placeholder="Search tenants..." 
            style={{ width: 250 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Business Name</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Domain</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Users</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>30d Vol</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Created</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TENANTS.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '.9rem' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{t.domain}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span className={`badge badge-${t.status === 'active' ? 'green' : t.status === 'suspended' ? 'red' : 'gold'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px' }}>{t.users}</td>
                  <td style={{ padding: '12px 20px' }}>${t.revenue.toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{t.created}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <button className="btn btn-outline btn-sm">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
