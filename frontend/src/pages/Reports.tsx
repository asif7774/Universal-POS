import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

// ── Types ─────────────────────────────────────────────────────
interface Order {
  id: string;
  orderNo: string;
  status: string;
  type: string;
  total: string | null;
  subtotal: string | null;
  taxAmt: string | null;
  discountAmt: string | null;
  paymentMethod: string | null;
  createdAt: string;
}

interface DailySummary {
  date: string;
  revenue: number;
  count: number;
  rentalCount: number;
  orders: Order[];
}

// ── Inline SVG chart helpers ──────────────────────────────────
const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; height?: number }> = ({ data, height = 120 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>${(d.value).toFixed(0)}</span>
          <div style={{ width: '100%', position: 'relative', height: height - 36 }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${(d.value / max) * 100}%`,
              background: d.color ?? 'var(--tux-navy)',
              borderRadius: '4px 4px 0 0',
              transition: 'height .4s ease',
              minHeight: d.value > 0 ? 4 : 0,
            }} />
          </div>
          <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const DonutChart: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const R = 50, CX = 65, CY = 65, stroke = 18;
  const circumference = 2 * Math.PI * R;
  let cumulative = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={130} height={130} viewBox="0 0 130 130" style={{ flexShrink: 0 }}>
        {segments.map((s, i) => {
          const pct = s.value / total;
          const dashArray = `${pct * circumference} ${circumference}`;
          const offset = circumference - cumulative * circumference;
          cumulative += pct;
          return (
            <circle key={i} cx={CX} cy={CY} r={R}
              fill="none" stroke={s.color} strokeWidth={stroke}
              strokeDasharray={dashArray} strokeDashoffset={offset}
              style={{ transform: `rotate(-90deg)`, transformOrigin: `${CX}px ${CY}px` }}
            />
          );
        })}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--text-primary)">${(total).toFixed(0)}</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="8" fill="#94A3B8">Total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 700 }}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ── Reports Page ──────────────────────────────────────────────
const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const today = new Date().toISOString().split('T')[0];

  const { data: summary, isLoading: summaryLoading } = useQuery<DailySummary>({
    queryKey: ['orders-summary', today],
    queryFn: () => apiClient.get(`/orders/summary?date=${today}`),
    refetchInterval: 30000, // refresh every 30s
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['orders', 'recent'],
    queryFn: () => apiClient.get('/orders?limit=10'),
    refetchInterval: 30000,
  });

  const revenue = summary?.revenue ?? 0;
  const orderCount = summary?.count ?? 0;
  const rentalCount = summary?.rentalCount ?? 0;
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

  // Payment method breakdown from recent orders
  const paymentBreakdown = recentOrders.reduce((acc: Record<string, number>, o) => {
    const method = o.paymentMethod ?? 'unknown';
    acc[method] = (acc[method] ?? 0) + parseFloat(o.total ?? '0');
    return acc;
  }, {});

  const donutSegments = [
    { label: 'Cash', value: paymentBreakdown['cash'] ?? 0, color: '#1E3A5F' },
    { label: 'Card', value: paymentBreakdown['card'] ?? 0, color: '#D4AF37' },
    { label: 'Check', value: paymentBreakdown['check'] ?? 0, color: '#10B981' },
  ].filter(s => s.value > 0);

  // Last 7 recent orders revenue per day (simplified)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];
    const dayRevenue = recentOrders
      .filter(o => new Date(o.createdAt).toISOString().split('T')[0] === dateStr)
      .reduce((s, o) => s + parseFloat(o.total ?? '0'), 0);
    return { label, value: dayRevenue, color: dateStr === today ? 'var(--tux-gold)' : 'var(--tux-navy)' };
  });

  const isLoading = summaryLoading || ordersLoading;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">
            Live data · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['today', 'week', 'month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Today KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: "Today's Revenue", value: isLoading ? '—' : fmt(revenue), icon: '💵', color: 'var(--tux-navy)' },
          { label: 'Orders Today', value: isLoading ? '—' : orderCount.toString(), icon: '🧾', color: 'var(--tux-navy)' },
          { label: 'Rentals Today', value: isLoading ? '—' : rentalCount.toString(), icon: '🎩', color: 'var(--tux-gold-dark)' },
          { label: 'Avg Order Value', value: isLoading ? '—' : fmt(avgOrder), icon: '📈', color: 'var(--status-success)' },
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

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* 7-day bar chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue — Last 7 Days</span>
            <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Live from orders</span>
          </div>
          {isLoading ? (
            <div className="skeleton" style={{ height: 120 }} />
          ) : (
            <BarChart data={last7} height={140} />
          )}
        </div>

        {/* Payment breakdown donut */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Payment Methods</span>
          </div>
          {isLoading ? (
            <div className="skeleton" style={{ height: 120 }} />
          ) : donutSegments.length > 0 ? (
            <DonutChart segments={donutSegments} />
          ) : (
            <div className="empty-state" style={{ padding: 20 }}>
              <div className="empty-state-icon">📊</div>
              <p style={{ fontSize: '.85rem' }}>No orders yet today</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Orders</span>
          <a href="/pos" style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 600 }}>+ New Order →</a>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <p>No orders yet. <a href="/pos" style={{ color: 'var(--tux-navy)', fontWeight: 600 }}>Start selling →</a></p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
                  {['Order #', 'Type', 'Status', 'Payment', 'Subtotal', 'Tax', 'Total', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '.78rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <tr key={o.id} style={{ borderBottom: i < recentOrders.length - 1 ? '1px solid var(--surface-border)' : 'none', transition: 'background .12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--tux-navy)' }}>{o.orderNo}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${o.type === 'rental' ? 'badge-gold' : o.type === 'mixed' ? 'badge-navy' : 'badge-navy'}`} style={{ fontSize: '.7rem' }}>
                        {o.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${o.status === 'completed' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '.7rem' }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textTransform: 'capitalize' }}>{o.paymentMethod ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{o.subtotal ? fmt(parseFloat(o.subtotal)) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{o.taxAmt ? fmt(parseFloat(o.taxAmt)) : '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--tux-navy)' }}>{o.total ? fmt(parseFloat(o.total)) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(o.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
