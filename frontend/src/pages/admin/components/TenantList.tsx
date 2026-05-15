import React from 'react';
import { Tenant } from 'types/admin';

interface TenantListProps {
  tenants: Tenant[];
  search: string;
  setSearch: (val: string) => void;
}

export const TenantList: React.FC<TenantListProps> = ({ tenants, search, setSearch }) => {
  return (
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
            {tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map(t => (
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
  );
};
