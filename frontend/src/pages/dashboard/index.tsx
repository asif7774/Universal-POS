import React from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { useDashboardAlerts, useRecentOrders, useUpcomingRentals, useAppointmentCount, useSettings } from '../../lib/queries';
import { StatProps } from 'types/dashboard';
import { StatCard } from './components/StatCard';
import { RecentOrders } from './components/RecentOrders';
import { QuickActions } from './components/QuickActions';
import { UpcomingPickups } from './components/UpcomingPickups';
import { RentalFleetStatus } from './components/RentalFleetStatus';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { Skeleton } from 'components/atoms/skeleton/Skeleton';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: orderSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['orders-summary', todayStr],
    queryFn: () => apiClient.get<{ revenue: number, count: number }>(`/orders/summary?date=${todayStr}`),
  });

  const { data: rentalStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['rentals-stats'],
    queryFn: () => apiClient.get<{ total: number, booked: number, out: number, overdue: number, returned: number }>('/rentals/stats'),
  });

  // Sprint 2 — Live data hooks
  const { data: alerts = [] } = useDashboardAlerts();
  const { data: recentOrders = [] } = useRecentOrders(5);
  const { data: upcomingRentals = [] } = useUpcomingRentals(3);
  const { data: appointmentData, isLoading: isLoadingAppts } = useAppointmentCount(todayStr);
  const { data: settings } = useSettings();

  const isLoadingDashboard = isLoadingSummary || isLoadingStats || isLoadingAppts;

  if (isLoadingDashboard) {
    return (
      <div className="animate-fade-in">
        <div className="page-header py-6 px-8 flex items-center gap-6 border-none bg-white rounded-xl shadow-sm">
          <Skeleton circle width={64} height={64} />
          <div className="flex-1">
             <Skeleton width={140} height={12} className="mb-2" />
             <Skeleton width={200} height={28} />
          </div>
          <div className="flex gap-3">
             <Skeleton width={120} height={40} />
             <Skeleton width={180} height={40} />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-4 mb-8">
           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={120} className="rounded-lg" />)}
        </div>
        <div className="grid grid-cols-[1fr_340px] gap-5">
           <Skeleton height={400} className="rounded-xl" />
           <div className="flex flex-col gap-5">
              <Skeleton height={200} className="rounded-xl" />
              <Skeleton height={240} className="rounded-xl" />
           </div>
        </div>
      </div>
    );
  }

  const STATS: StatProps[] = [
    { label: "Today's Revenue", value: `$${orderSummary?.revenue?.toFixed(2) ?? '0.00'}`, change: '', positive: true, icon: 'banknote', color: 'var(--tux-navy)', sparkData: [32,28,45,38,52,48,60] },
    { label: 'Active Rentals', value: `${rentalStats?.out ?? 0}`, change: '', positive: true, icon: 'rental', color: 'var(--tux-gold)', sparkData: [18,20,22,19,23,21,23] },
    { label: 'Appointments Today', value: `${appointmentData?.count ?? 0}`, change: '', positive: true, icon: 'appointments', color: 'var(--status-success)', sparkData: [10,8,12,9,8,11,8] },
    { label: 'Overdue Returns', value: `${rentalStats?.overdue ?? 0}`, change: '', positive: false, icon: 'warning', color: 'var(--status-error)', sparkData: [0,1,2,1,3,2,2] },
  ];

  const rentalFleet = [
    { status: 'Available', count: Math.max(0, (rentalStats?.total ?? 0) - ((rentalStats?.out ?? 0) + (rentalStats?.booked ?? 0))), total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Out', count: rentalStats?.out ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Overdue', count: rentalStats?.overdue ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Booked', count: rentalStats?.booked ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header py-6 px-8 flex items-center gap-6 border-none bg-gradient-to-r from-surface-card to-surface-bg shadow-sm rounded-xl flex-row flex-nowrap">
        <div className="w-16 h-16 rounded-full bg-tux-navy flex items-center justify-center text-tux-gold text-2xl font-extrabold border-4 border-white shadow-md shrink-0">
          {user?.name?.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-text-muted text-[0.75rem] font-bold uppercase tracking-wider mb-1">
            <SvgIcon name="location" width="12" height="12" className="text-tux-gold" />
            {settings?.name || 'TuxedoPOS'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <h1 className="page-title m-0 text-[1.85rem] font-display">
            {greeting}, {user?.name?.split(' ')[0] ?? 'User'}
          </h1>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="btn btn-outline bg-white border-[1.5px]">
            <SvgIcon name="search" width="16" height="16" />
            Quick Search
          </button>
          <a href="/pos" className="btn btn-gold py-3 px-6 shadow-gold">
            <SvgIcon name="pos" width="20" height="20" />
            Open POS Terminal
          </a>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
           <h2 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
             Business Pulse
           </h2>
           <div className="h-px flex-1 bg-surface-border opacity-50" />
        </div>
        
        {/* Stat cards grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 mb-6">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Priority Alerts "Command Center" */}
        {alerts.length > 0 && (
          <div className="card p-6 bg-gradient-to-br from-[#FFF5F5] to-white border-dashed border-[#FECACA] shadow-none">
             <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-status-error flex items-center justify-center text-white shadow-[0_4px_12px_rgba(239,68,68,0.2)]">
                     <SvgIcon name="warning" width="18" height="18" />
                  </div>
                  <div>
                     <div className="font-extrabold text-[0.95rem] text-[#991B1B]">Attention Required</div>
                     <div className="text-[0.75rem] text-[#B91C1C] opacity-70">{alerts.length} items need immediate action</div>
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost text-[#991B1B]">Dismiss All</button>
             </div>
             
             <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
                {alerts.map((a, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white shadow-sm flex gap-3 items-start border border-[#FEE2E2] transition-transform duration-200">
                    <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 ${a.type === 'error' ? 'bg-[#FEF2F2] text-status-error' : 'bg-[#FFFBEB] text-status-warning'}`}>
                       <SvgIcon name="warning" width="14" height="14" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.82rem] font-semibold text-text-primary leading-normal">{a.msg}</div>
                      <div className="flex gap-2 mt-2">
                         <button className="bg-transparent border-none p-0 text-tux-navy text-[0.7rem] font-bold cursor-pointer underline">Take Action</button>
                         <button className="bg-transparent border-none p-0 text-text-muted text-[0.7rem] cursor-pointer">Ignore</button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
        <RecentOrders orders={recentOrders.map((o: any) => ({
          id: o.id,
          orderNo: o.orderNo,
          customer: o.customerName || 'Guest',
          type: o.type,
          total: o.total,
          status: o.status,
          time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))} />

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <QuickActions />
          <UpcomingPickups rentals={upcomingRentals.map((r: any) => ({
            customer: r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : 'Unknown',
            item: r.items?.[0]?.productName || 'Rental Item',
            event: r.eventName || 'Pickup',
            date: new Date(r.pickupDate).toLocaleDateString(),
            deposit: `$${r.depositPaid || '0.00'}`
          }))} />
          <RentalFleetStatus fleet={rentalFleet} />
          <PredictiveAnalytics />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
