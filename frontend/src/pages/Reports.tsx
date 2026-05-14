import React, { useState } from 'react';

// ── Inline SVG chart helpers ──────────────────────────────────

const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; height?: number }> = ({ data, height = 120 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>${(d.value/1000).toFixed(1)}k</span>
          <div style={{ width: '100%', position: 'relative', height: height - 36 }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${(d.value / max) * 100}%`,
              background: d.color ?? 'var(--tux-navy)',
              borderRadius: '4px 4px 0 0',
              transition: 'height .4s ease',
              minHeight: 4,
            }} />
          </div>
          <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const LineChart: React.FC<{ data: number[]; labels: string[]; color?: string; height?: number }> = ({ data, labels, color = '#1E3A5F', height = 100 }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 300, H = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 20) - 10;
    return `${x},${y}`;
  });
  const area = `0,${H} ${pts.join(' ')} ${W},${H}`;

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" height={H + 24} viewBox={`0 0 ${W} ${H + 24}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#grad-${color.replace('#','')})`} />
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * W;
          const y = H - ((v - min) / range) * (H - 20) - 10;
          return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="white" strokeWidth="2" />;
        })}
        {/* Labels */}
        {labels.map((l, i) => {
          const x = (i / (data.length - 1)) * W;
          return <text key={i} x={x} y={H + 18} textAnchor="middle" fontSize="9" fill="#94A3B8">{l}</text>;
        })}
      </svg>
    </div>
  );
};

const DonutChart: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((s, d) => s + d.value, 0);
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
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text-primary)">${(total/1000).toFixed(0)}k</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="8" fill="#94A3B8">Total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 700 }}>{Math.round((s.value/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Mock data ─────────────────────────────────────────────────
const WEEKLY_REVENUE = [3200, 4100, 3800, 4820, 5200, 4600, 5800];
const WEEK_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MONTHLY_REVENUE = [18400, 22100, 19800, 24200, 21500, 26800, 23100, 28400, 25200, 31000, 27800, 33200];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const REVENUE_BY_CATEGORY = [
  { label: 'Tuxedo Rental', value: 18600, color: '#1E3A5F' },
  { label: 'Suit Rental',   value: 7200,  color: '#2A4F80' },
  { label: 'Accessories',   value: 3400,  color: '#D4AF37' },
  { label: 'Alterations',   value: 2800,  color: '#10B981' },
  { label: 'Purchases',     value: 1800,  color: '#8B5CF6' },
];

const TOP_ITEMS = [
  { name: 'Black Classic Tuxedo',   rentals: 47, revenue: 3995,  trend: '+12%' },
  { name: 'Navy Slim Fit Tuxedo',   rentals: 38, revenue: 3420,  trend: '+8%' },
  { name: 'Wedding Package (Full)', rentals: 22, revenue: 7480,  trend: '+22%' },
  { name: 'White Dinner Jacket',    rentals: 19, revenue: 1425,  trend: '-3%' },
  { name: 'Black Patent Shoes',     rentals: 61, revenue: 1525,  trend: '+5%' },
];

const STATS_MTD = [
  { label: "Month's Revenue",  value: '$28,400',  change: '+15.2%', positive: true,  icon: '💵' },
  { label: 'Total Rentals',    value: '186',      change: '+22',    positive: true,  icon: '🎩' },
  { label: 'Avg Rental Value', value: '$152',     change: '+$18',   positive: true,  icon: '📈' },
  { label: 'New Customers',    value: '34',       change: '-4',     positive: false, icon: '👤' },
];

const RECENT_PAYMENTS = [
  { customer: 'Marcus Johnson',  amount: 340,  method: 'Card',  type: 'Rental',    time: '2 hr ago' },
  { customer: 'Kevin Park',      amount: 890,  method: 'Cash',  type: 'Group',     time: '4 hr ago' },
  { customer: 'Robert Chen',     amount: 110,  method: 'Card',  type: 'Alteration',time: 'Yesterday' },
  { customer: 'David Williams',  amount: 210,  method: 'Cash',  type: 'Rental',    time: 'Yesterday' },
  { customer: 'Alex Rivera',     amount: 150,  method: 'Check', type: 'Deposit',   time: '2 days ago' },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const chartData = period === 'week' ? { data: WEEKLY_REVENUE, labels: WEEK_LABELS } : { data: MONTHLY_REVENUE, labels: MONTH_LABELS };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">TuxedoPOS HQ · May 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['week','month','year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}>
              {p}
            </button>
          ))}
          <button className="btn btn-outline btn-sm">⬇ Export CSV</button>
        </div>
      </div>

      {/* MTD stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STATS_MTD.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className={`stat-change ${s.positive ? 'positive' : 'negative'}`}>
                  {s.positive ? '↑' : '↓'} {s.change} vs last month
                </div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue Trend — {period === 'week' ? 'This Week' : period === 'month' ? '2026 Monthly' : '3-Year'}</span>
            <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--status-success)' }}>↑ 15.2% vs last period</span>
          </div>
          <LineChart data={chartData.data} labels={chartData.labels} color="#1E3A5F" height={110} />
        </div>

        {/* Revenue breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue by Category</span>
          </div>
          <DonutChart segments={REVENUE_BY_CATEGORY} />
        </div>
      </div>

      {/* Second row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Daily breakdown bar chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Daily Revenue — This Week</span>
          </div>
          <BarChart
            data={WEEK_LABELS.map((l, i) => ({
              label: l,
              value: WEEKLY_REVENUE[i],
              color: i === 3 ? 'var(--tux-gold)' : 'var(--tux-navy)',
            }))}
            height={140}
          />
        </div>

        {/* Top performing items */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Items This Month</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {TOP_ITEMS.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < TOP_ITEMS.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }}>{i+1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{item.rentals} rentals</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--tux-navy)' }}>${item.revenue.toLocaleString()}</div>
                  <div style={{ fontSize: '.72rem', color: item.trend.startsWith('+') ? 'var(--status-success)' : 'var(--status-error)', fontWeight: 600 }}>{item.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent payments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Payments</span>
            <a href="/pos" style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 600 }}>View all →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {RECENT_PAYMENTS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < RECENT_PAYMENTS.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                <div className="avatar" style={{ width: 34, height: 34, fontSize: '.72rem', flexShrink: 0 }}>
                  {p.customer.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{p.customer}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{p.type} · {p.time}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{fmt(p.amount)}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{p.method}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Key Metrics</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Rental Utilization Rate', value: 73, color: 'var(--tux-navy)', suffix: '%' },
              { label: 'Deposit Conversion Rate', value: 91, color: 'var(--status-success)', suffix: '%' },
              { label: 'On-Time Return Rate', value: 87, color: 'var(--tux-gold)', suffix: '%' },
              { label: 'Repeat Customer Rate', value: 64, color: '#8B5CF6', suffix: '%' },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
                  <span style={{ fontWeight: 800, color: m.color }}>{m.value}{m.suffix}</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface-border)', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${m.value}%`, background: m.color, borderRadius: 999, transition: 'width .5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* Quick KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Avg Days Rented', value: '3.2' },
              { label: 'Late Fees Collected', value: '$340' },
              { label: 'Cleaning Turnaround', value: '1.4 days' },
            ].map(k => (
              <div key={k.label} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--surface-hover)', borderRadius: 8 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--tux-navy)' }}>{k.value}</div>
                <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
