import React from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

// ── Mini chart sparkline ──────────────────────────────────────
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={color} fillOpacity=".12" stroke="none"
      />
    </svg>
  );
};

// ── Stat Card ─────────────────────────────────────────────────
interface StatProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  sparkData: number[];
  color: string;
  icon: string;
}

const StatCard: React.FC<StatProps> = ({ label, value, change, positive, sparkData, color, icon }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${positive ? 'positive' : 'negative'}`}>
          {positive ? '↑' : '↓'} {change} vs last week
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
  </div>
);

// ── Mock data ─────────────────────────────────────────────────
const RECENT_ORDERS = [
  { id: 'ORD-1024', customer: 'Marcus Johnson', type: 'Rental + Tailoring', total: '$340', status: 'Completed', time: '2 min ago' },
  { id: 'ORD-1023', customer: 'David Williams', type: 'Tuxedo Rental', total: '$180', status: 'Out', time: '18 min ago' },
  { id: 'ORD-1022', customer: 'Robert Chen', type: 'Purchase', total: '$520', status: 'Completed', time: '42 min ago' },
  { id: 'ORD-1021', customer: 'James Thompson', type: 'Alteration Only', total: '$85', status: 'Processing', time: '1 hr ago' },
  { id: 'ORD-1020', customer: 'Kevin Park', type: 'Group Booking (4)', total: '$890', status: 'Booked', time: '2 hr ago' },
];

const UPCOMING_RENTALS = [
  { customer: 'Alex Rivera', item: 'Black Slim Tuxedo (42R)', event: "Wedding — Sarah's Banquet Hall", date: 'May 15', deposit: '$200' },
  { customer: 'Michael Lee', item: 'Navy Suit (40R)', event: 'Prom — Central HS', date: 'May 16', deposit: '$150' },
  { customer: 'Carlos Mendez', item: 'White Tuxedo (44L)', event: 'Anniversary Gala', date: 'May 18', deposit: '$200' },
];

const ALERTS = [
  { type: 'warning', msg: 'ORD-1020: Kevin Park pick-up tomorrow — 4 suits pending alterations' },
  { type: 'error',   msg: '2 rentals overdue: Marcus D. (3 days), Tom H. (1 day)' },
  { type: 'info',    msg: 'Low stock: Black Slim Tuxedo size 38R — only 1 remaining' },
];

const STATUS_BADGE: Record<string, string> = {
  Completed: 'badge-green', Out: 'badge-navy', Processing: 'badge-yellow',
  Booked: 'badge-gold', Overdue: 'badge-red',
};

// ── Dashboard ─────────────────────────────────────────────────
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
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

        {/* Recent Orders */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--surface-border)' }}>
            <span className="card-title">Recent Orders</span>
            <a href="/pos" style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 600 }}>View all →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map(o => (
                <tr key={o.id}>
                  <td><code style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 600 }}>{o.id}</code></td>
                  <td style={{ fontWeight: 500 }}>{o.customer}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>{o.type}</td>
                  <td style={{ fontWeight: 700 }}>{o.total}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-gray'}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick actions */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'New Rental', icon: '🎩', path: '/rentals/new', color: 'var(--tux-navy)' },
                { label: 'New Customer', icon: '👤', path: '/customers/new', color: 'var(--tux-navy)' },
                { label: 'Take Measurement', icon: '📐', path: '/measurements/new', color: 'var(--tux-navy)' },
                { label: 'New Appointment', icon: '📅', path: '/appointments/new', color: 'var(--tux-navy)' },
              ].map(a => (
                <a key={a.label} href={a.path} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 8px', borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--surface-border)',
                  background: 'var(--surface-hover)', cursor: 'pointer',
                  textDecoration: 'none', color: 'var(--text-primary)',
                  transition: 'all .15s', fontSize: '.8rem', fontWeight: 600,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--tux-navy)'; (e.currentTarget as HTMLElement).style.background = '#EEF2F8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{a.icon}</span>
                  {a.label}
                </a>
              ))}
            </div>
          </div>

          {/* Upcoming pickups */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Upcoming Pickups</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {UPCOMING_RENTALS.map((r, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--tux-gold)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '.875rem' }}>{r.customer}</span>
                    <span className="badge badge-gold">{r.date}</span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{r.item}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>📍 {r.event}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--status-success)', marginTop: 4, fontWeight: 600 }}>
                    Deposit: {r.deposit} ✓
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rental inventory snapshot */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Rental Fleet Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rentalFleet.map(r => (
                <div key={r.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.8rem' }}>
                    <span style={{ fontWeight: 500 }}>{r.status}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-border)', borderRadius: 999 }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: `${(r.count / r.total) * 100}%`,
                      background: r.status === 'Available' ? 'var(--status-success)' :
                        r.status === 'Out' ? 'var(--tux-navy)' :
                        r.status === 'Overdue' ? 'var(--status-error)' : 'var(--tux-gold)',
                      transition: 'width .3s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
