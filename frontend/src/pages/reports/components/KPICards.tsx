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
        { label: 'Revenue',        value: isLoading ? <Skeleton width={80} height={28} /> : fmt(revenue || last7DaysTotal), icon: 'banknote',   colorVariant: 'gold'    },
        { label: 'Total Orders',   value: isLoading ? <Skeleton width={60} height={28} /> : (orderCount || recentOrdersCount).toString(),        icon: 'receipt',    colorVariant: 'primary' },
        { label: 'Active Rentals', value: isLoading ? <Skeleton width={60} height={28} /> : rentalCount.toString(),                              icon: 'tuxedo',     colorVariant: 'emerald' },
        { label: 'Avg Order Value',value: isLoading ? <Skeleton width={80} height={28} /> : fmt(avgOrder),                                       icon: 'chart-bar',  colorVariant: 'primary' },
      ].map(s => {
        const valueClass =
          s.colorVariant === 'gold'    ? 'stat-value stat-value-gold'    :
          s.colorVariant === 'emerald' ? 'stat-value stat-value-emerald' :
          s.colorVariant === 'error'   ? 'stat-value stat-value-error'   :
          'stat-value stat-value-primary';

        const iconStyle =
          s.colorVariant === 'gold'    ? { color: 'var(--accent-gold-text)' }   :
          s.colorVariant === 'emerald' ? { color: 'var(--accent-emerald-text)' } :
          s.colorVariant === 'error'   ? { color: 'var(--status-error)' }        :
          { color: 'var(--text-primary)' };

        return (
          <div key={s.label} className="stat-card">
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-label">{s.label}</div>
                <div className={valueClass}>{s.value}</div>
              </div>
              <div className="opacity-80" style={iconStyle}>
                <SvgIcon name={s.icon} width="24" height="24" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
