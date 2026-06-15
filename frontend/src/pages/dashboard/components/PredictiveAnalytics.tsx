import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
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

  const topRisk = categoryData.find(d => d.risk === 'high');

  if (inventory.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-[0.8rem] text-text-muted text-center py-4">No inventory data available</div>
      </div>
    );
  }

  return (
    <div className="card p-6 bg-gradient-to-br from-surface-card to-surface-bg border-none shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-tux-gold/20 flex items-center justify-center text-tux-gold">
          <SvgIcon name="dashboard" width="20" height="20" />
        </div>
        <div>
          <h3 className="font-display text-[1.1rem] text-text-primary m-0">Stock Health</h3>
          <p className="text-[0.7rem] text-text-muted m-0">Current availability by category</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {categoryData.map((p) => (
          <div key={p.category} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[0.8rem] font-semibold text-text-primary">{p.category}</span>
              <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                p.risk === 'high' ? 'bg-status-error/10 text-status-error' :
                p.risk === 'medium' ? 'bg-status-warning/10 text-status-warning' :
                'bg-status-success/10 text-status-success'
              }`}>
                {p.risk === 'high' ? 'Low Stock' : p.risk === 'medium' ? 'Moderate' : 'In Stock'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-surface-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    p.risk === 'high' ? 'bg-status-error' :
                    p.risk === 'medium' ? 'bg-status-warning' :
                    'bg-tux-navy'
                  }`}
                  style={{ width: `${p.total > 0 ? Math.round((p.available / p.total) * 100) : 0}%` }}
                />
              </div>
              <div className="flex flex-col items-end shrink-0 min-w-[50px]">
                <span className="text-[0.75rem] font-bold text-text-primary">{p.available}</span>
                <span className="text-[0.6rem] text-text-muted">of {p.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {topRisk && (
        <div className="mt-6 pt-4 border-t border-surface-border">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-status-error/5 border border-status-error/10">
            <SvgIcon name="warning" width="16" height="16" className="text-status-error mt-0.5 shrink-0" />
            <p className="text-[0.72rem] text-text-secondary leading-relaxed m-0">
              <strong>Low stock:</strong> <span className="font-bold text-text-primary">{topRisk.category}</span> has only {topRisk.available} of {topRisk.total} units available. Restock recommended.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
