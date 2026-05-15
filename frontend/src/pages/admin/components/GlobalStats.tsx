import React from 'react';

export const GlobalStats: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-5 mb-6">
      {[
        { label: 'Total Tenants', value: '4' },
        { label: 'Active Terminals', value: '23' },
        { label: 'MRR', value: '$8,450' },
        { label: 'Sys Health', value: '99.9%', ok: true },
      ].map((s, i) => (
        <div key={i} className="card p-5">
          <div className="text-[0.85rem] text-[var(--text-secondary)] font-semibold">{s.label}</div>
          <div className={`text-[1.75rem] font-extrabold mt-1 ${s.ok ? 'text-[var(--status-success)]' : 'text-[var(--text-primary)]'}`}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
};
