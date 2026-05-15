import React from 'react';
import { Skeleton } from 'components/atoms/skeleton/Skeleton';
import { fmt } from 'constants/reports';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

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
    <div className="grid grid-cols-4 gap-3.5 mb-6">
      {[
        { label: "Revenue", value: isLoading ? <Skeleton width={80} height={28} /> : fmt(revenue || last7DaysTotal), icon: 'banknote', color: 'var(--tux-navy)' },
        { label: 'Total Orders', value: isLoading ? <Skeleton width={60} height={28} /> : (orderCount || recentOrdersCount).toString(), icon: 'receipt', color: 'var(--tux-navy)' },
        { label: 'Active Rentals', value: isLoading ? <Skeleton width={60} height={28} /> : rentalCount.toString(), icon: 'tuxedo', color: 'var(--tux-gold-dark)' },
        { label: 'Avg Order Value', value: isLoading ? <Skeleton width={80} height={28} /> : fmt(avgOrder), icon: 'chart-bar', color: 'var(--status-success)' },
      ].map(s => (
        <div key={s.label} className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
            <div className="opacity-80" style={{ color: s.color }}>
              <SvgIcon name={s.icon} width="24" height="24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
