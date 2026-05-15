import React from 'react';
import { useAdminStats } from '../../../lib/queries';

export const GlobalStats: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats();

  const items = [
    { label: 'Total Tenants', value: stats?.totalTenants ?? '—' },
    { label: 'Active Terminals', value: stats?.activeTerminals ?? '—' },
    { label: 'MRR', value: stats?.mrr ? `$${stats.mrr.toLocaleString()}` : '—' },
    { label: 'Sys Health', value: stats?.systemHealth ? `${stats.systemHealth}%` : '—', ok: (stats?.systemHealth ?? 0) >= 99 },
  ];

  return (
    <div className="grid grid-cols-4 gap-5 mb-6">
      {items.map((s, i) => (
        <div key={i} className="card p-5">
          <div className="text-[0.85rem] text-[var(--text-secondary)] font-semibold">{s.label}</div>
          <div className={`text-[1.75rem] font-extrabold mt-1 ${s.ok ? 'text-[var(--status-success)]' : 'text-[var(--text-primary)]'}`}>
            {isLoading ? '...' : s.value}
          </div>
        </div>
      ))}
    </div>
  );
};
