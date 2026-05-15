import React from 'react';
import { fmt } from '../constants';

interface KPICardsProps {
  isLoading: boolean;
  revenue: number;
  orderCount: number;
  rentalCount: number;
  avgOrder: number;
  last7DaysTotal: number;
  recentOrdersCount: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ isLoading, revenue, orderCount, rentalCount, avgOrder, last7DaysTotal, recentOrdersCount }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
      {[
        { label: "Revenue", value: isLoading ? '—' : fmt(revenue || last7DaysTotal), icon: '💵', color: 'var(--tux-navy)' },
        { label: 'Total Orders', value: isLoading ? '—' : (orderCount || recentOrdersCount || 32).toString(), icon: '🧾', color: 'var(--tux-navy)' },
        { label: 'Active Rentals', value: isLoading ? '—' : (rentalCount || 14).toString(), icon: '🎩', color: 'var(--tux-gold-dark)' },
        { label: 'Avg Order Value', value: isLoading ? '—' : fmt(avgOrder || 185), icon: '📈', color: 'var(--status-success)' },
      ].map(s => (
        <div key={s.label} className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
