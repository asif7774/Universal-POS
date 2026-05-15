import React from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { ALERTS, RECENT_ORDERS, UPCOMING_RENTALS } from 'constants/dashboard';
import { StatProps } from 'types/dashboard';
import { StatCard } from './components/StatCard';
import { RecentOrders } from './components/RecentOrders';
import { QuickActions } from './components/QuickActions';
import { UpcomingPickups } from './components/UpcomingPickups';
import { RentalFleetStatus } from './components/RentalFleetStatus';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: orderSummary } = useQuery({
    queryKey: ['orders-summary', todayStr],
    queryFn: () => apiClient.get<{ revenue: number, count: number }>(`/orders/summary?date=${todayStr}`),
  });

  const { data: rentalStats } = useQuery({
    queryKey: ['rentals-stats'],
    queryFn: () => apiClient.get<{ total: number, booked: number, out: number, overdue: number, returned: number }>('/rentals/stats'),
  });

  const STATS: StatProps[] = [
    { label: "Today's Revenue", value: `$${orderSummary?.revenue?.toFixed(2) ?? '0.00'}`, change: '12.4%', positive: true, icon: '💵', color: '#1E3A5F', sparkData: [32,28,45,38,52,48,60] },
    { label: 'Active Rentals', value: `${rentalStats?.out ?? 0}`, change: '3', positive: true, icon: '🎩', color: '#D4AF37', sparkData: [18,20,22,19,23,21,23] },
    { label: 'Appointments Today', value: '8', change: '2', positive: false, icon: '📅', color: '#10B981', sparkData: [10,8,12,9,8,11,8] },
    { label: 'Overdue Returns', value: `${rentalStats?.overdue ?? 0}`, change: '1', positive: false, icon: '⚠️', color: '#EF4444', sparkData: [0,1,2,1,3,2,2] },
  ];

  const rentalFleet = [
    { status: 'Available', count: Math.max(0, (rentalStats?.total ?? 0) - ((rentalStats?.out ?? 0) + (rentalStats?.booked ?? 0))), total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Out', count: rentalStats?.out ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Overdue', count: rentalStats?.overdue ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Booked', count: rentalStats?.booked ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0] ?? 'User'} 👋</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp;TuxedoPOS HQ
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm">
            <SvgIcon name="search" width="14" height="14" />
            Quick Search
          </button>
          <a href="/pos" className="btn btn-gold">
            🛒 Open POS
          </a>
        </div>
      </div>

      {/* Alerts */}
      {ALERTS.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {ALERTS.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: a.type === 'error' ? '#FEF2F2' : a.type === 'warning' ? '#FFFBEB' : '#EFF6FF',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${a.type === 'error' ? '#FECACA' : a.type === 'warning' ? '#FDE68A' : '#BFDBFE'}`,
              fontSize: '.82rem', color: a.type === 'error' ? '#991B1B' : a.type === 'warning' ? '#92400E' : '#1E40AF',
            }}>
              <span>{a.type === 'error' ? '🔴' : a.type === 'warning' ? '🟡' : 'ℹ️'}</span>
              {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        <RecentOrders orders={RECENT_ORDERS} />

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <QuickActions />
          <UpcomingPickups rentals={UPCOMING_RENTALS} />
          <RentalFleetStatus fleet={rentalFleet} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
