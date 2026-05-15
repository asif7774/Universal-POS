import React from 'react';

export const GlobalStats: React.FC = () => {
  return (
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
  );
};
