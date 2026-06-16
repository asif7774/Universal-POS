import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { useDashboardAlerts, useRecentOrders, useUpcomingRentals, useAppointmentCount, useSettings, useRevenueReport, useServerTime } from '../../lib/queries';
import { StatProps } from 'types/dashboard';
import { StatCard } from './components/StatCard';
import { RecentOrders } from './components/RecentOrders';
import { QuickActions } from './components/QuickActions';
import { UpcomingPickups } from './components/UpcomingPickups';
import { RentalFleetStatus } from './components/RentalFleetStatus';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { Skeleton } from 'components/atoms/skeleton/Skeleton';
import { usePageHeader } from 'contexts/PageHeaderContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: serverTime, isLoading: isLoadingTime } = useServerTime();
  // todayStr must never fall back to the client clock — a tampered OS clock would
  // let any user shift revenue into or out of "today". Block rendering until the
  // server-authoritative date arrives.
  const todayStr = serverTime?.date;
  const now = serverTime ? new Date(serverTime.timestamp) : null;
  const hour = now?.getHours() ?? 12;
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const { data: orderSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['orders-summary', todayStr],
    queryFn: () => apiClient.get<{ revenue: number, count: number }>(`/orders/summary?date=${todayStr}`),
    enabled: !!todayStr,
  });

  const { data: rentalStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['rentals-stats'],
    queryFn: () => apiClient.get<{ total: number, booked: number, out: number, overdue: number, returned: number }>('/rentals/stats'),
  });

  // Sprint 2 — Live data hooks
  const { data: alerts = [] } = useDashboardAlerts();
  const { data: recentOrders = [] } = useRecentOrders(5, todayStr);
  const { data: upcomingRentals = [] } = useUpcomingRentals(3);
  const { data: appointmentData, isLoading: isLoadingAppts } = useAppointmentCount(todayStr);
  const { data: settings } = useSettings();
  const { data: revenueData = [] } = useRevenueReport('week');

  const isLoadingDashboard = isLoadingTime || !todayStr || isLoadingSummary || isLoadingStats || isLoadingAppts;

  // Set the page header
  usePageHeader({
    title: `${greeting}, ${user?.name?.split(' ')[0] ?? 'User'}`,
    subtitle: `${settings?.name || 'TuxedoPOS'} · ${now?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) ?? ''}`,
    actions: (
      <div className="flex gap-3">
        <button className="btn btn-outline hidden sm:flex" onClick={() => { navigate('/pos'); }}>
          <SvgIcon name="search" width="16" height="16" />
          Quick Search
        </button>
        <Link to="/pos" className="btn btn-gold py-3 px-6 shadow-gold">
          <SvgIcon name="pos" width="20" height="20" />
          <span className="hidden sm:inline">Open POS Terminal</span>
          <span className="sm:hidden">POS</span>
        </Link>
      </div>
    ),
  });

  if (isLoadingDashboard) {
    return (
      <div className="animate-fade-in">
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={120} className="rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
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
    { label: "Today's Revenue",    value: `$${orderSummary?.revenue?.toFixed(2) ?? '0.00'}`, change: '', positive: true,  icon: 'banknote',     colorVariant: 'gold',    sparkData: revenueData.length ? revenueData.map(d => parseFloat(String(d.revenue)) || 0) : [0] },
    { label: 'Active Rentals',     value: `${rentalStats?.out ?? 0}`,                        change: '', positive: true,  icon: 'tuxedo',       colorVariant: 'emerald', sparkData: Array.from({ length: 7 }, () => rentalStats?.out ?? 0) },
    { label: 'Appointments Today', value: `${appointmentData?.count ?? 0}`,                  change: '', positive: true,  icon: 'appointments', colorVariant: 'primary', sparkData: Array.from({ length: 7 }, () => appointmentData?.count ?? 0) },
    { label: 'Overdue Returns',    value: `${rentalStats?.overdue ?? 0}`,                    change: '', positive: false, icon: 'warning',      colorVariant: 'error',   sparkData: Array.from({ length: 7 }, () => rentalStats?.overdue ?? 0) },
  ];

  const rentalFleet = [
    { status: 'Available', count: Math.max(0, (rentalStats?.total ?? 0) - ((rentalStats?.out ?? 0) + (rentalStats?.booked ?? 0))), total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Out', count: rentalStats?.out ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Overdue', count: rentalStats?.overdue ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
    { status: 'Booked', count: rentalStats?.booked ?? 0, total: Math.max(1, rentalStats?.total ?? 1) },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="section-divider">
          <span className="section-divider-label">Business Pulse</span>
          <div className="section-divider-line" />
        </div>
        
        {/* Stat cards grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 mb-6">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Priority Alerts "Command Center" */}
        {alerts.length > 0 && (
          <div className="panel p-6 border border-[var(--status-error-subtle)]">
             <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--status-error-subtle)] flex items-center justify-center text-[var(--status-error)]">
                     <SvgIcon name="warning" width="18" height="18" />
                  </div>
                  <div>
                     <div className="font-extrabold text-[0.95rem] text-[var(--status-error)]">Attention Required</div>
                     <div className="text-[0.75rem] text-[var(--text-muted)]">{alerts.length} items need immediate action</div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm text-[var(--status-error)]" onClick={() => { queryClient.setQueryData(['dashboard', 'alerts'], []); }}>Dismiss All</button>
             </div>

             <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
                {alerts.map((a, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[var(--bg-panel-hover)] flex gap-3 items-start border border-[var(--border-subtle)]">
                    <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 ${a.type === 'error' ? 'bg-[var(--status-error-subtle)] text-[var(--status-error)]' : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)]'}`}>
                       <SvgIcon name="warning" width="14" height="14" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.82rem] font-semibold text-[var(--text-primary)] leading-normal">{a.msg}</div>
                      <div className="flex gap-2 mt-2">
                         <button className="bg-transparent border-none p-0 text-[var(--accent-gold-text)] text-[0.7rem] font-bold cursor-pointer underline" onClick={() => { if (a.actionUrl) navigate(a.actionUrl); }}>Take Action</button>
                         <button className="bg-transparent border-none p-0 text-[var(--text-muted)] text-[0.7rem] cursor-pointer" onClick={() => { queryClient.setQueryData(['dashboard', 'alerts'], (prev: typeof alerts) => prev.filter((_, idx) => idx !== i)); }}>Ignore</button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
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
