import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { InventoryItem } from 'types/inventory';

export const PredictiveAnalytics: React.FC = () => {
  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: () => apiClient.get<InventoryItem[]>('/inventory'),
    staleTime: 5 * 60 * 1000,
  });

  const categoryData = useMemo(() => {
    const grouped = inventory.reduce<Record<string, { available: number; total: number }>>((acc, item) => {
      const cat = item.category;
      const avail = Object.values(item.sizes).reduce((s, sz) => s + sz.available, 0);
      const total = Object.values(item.sizes).reduce((s, sz) => s + sz.total, 0);
      if (!acc[cat]) acc[cat] = { available: 0, total: 0 };
      acc[cat].available += avail;
      acc[cat].total += total;
      return acc;
    }, {});

    return Object.entries(grouped)
      .slice(0, 4)
      .map(([category, data]) => {
        const ratio = data.total > 0 ? data.available / data.total : 1;
        const risk: 'low' | 'medium' | 'high' = ratio < 0.3 ? 'high' : ratio < 0.6 ? 'medium' : 'low';
        return { category, available: data.available, total: data.total, risk };
      })
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 } as const;
        return order[a.risk] - order[b.risk];
      });
  }, [inventory]);

  if (inventory.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Stock Health</h2>
            <p className="panel-subtitle">Current availability by category</p>
          </div>
        </div>
        <div className="p-4 text-sm text-[var(--text-muted)] text-center py-6">No inventory data available</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Stock Health</h2>
          <p className="panel-subtitle">Current availability by category</p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {categoryData.map(p => (
          <div key={p.category}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">{p.category}</span>
              <div className="flex items-center gap-2">
                <span className={`badge ${p.risk === 'high' ? 'badge-error' : p.risk === 'medium' ? 'badge-warning' : 'badge-emerald'}`}>
                  {p.risk === 'high' ? 'Low Stock' : p.risk === 'medium' ? 'Moderate' : 'In Stock'}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{p.available}/{p.total}</span>
              </div>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${p.risk === 'high' ? 'progress-fill-error' : p.risk === 'medium' ? 'progress-fill-gold' : 'progress-fill-emerald'}`}
                style={{ width: `${p.total > 0 ? Math.round((p.available / p.total) * 100) : 0}%` }}
                role="progressbar"
                aria-valuenow={p.available}
                aria-valuemin={0}
                aria-valuemax={p.total}
                aria-label={`${p.category} stock level`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
