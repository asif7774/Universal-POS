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
      <div className="card-header flex justify-between">
        <span className="card-title">All Tenants</span>
        <input 
          type="text" 
          className="input w-[250px]" 
          placeholder="Search tenants..." 
          value={search}
          onChange={e => { setSearch(e.target.value); }}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Users</th>
              <th>30d Vol</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map(t => (
              <tr key={t.id}>
                <td className="font-semibold">{t.name}</td>
                <td className="text-[var(--text-secondary)] capitalize">{t.domain}</td>
                <td>
                  <span className={`badge badge-${t.status === 'active' ? 'green' : t.status === 'suspended' ? 'red' : 'gold'}`}>
                    {t.status}
                  </span>
                </td>
                <td>{t.users}</td>
                <td className="font-bold">${t.revenue.toLocaleString()}</td>
                <td className="text-[var(--text-secondary)]">{t.created}</td>
                <td>
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
