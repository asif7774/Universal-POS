import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { fmt } from 'constants/reports';

const CHART_COLORS = {
  gold: '#c9a84c',
  emerald: '#3d9970',
  error: '#f87171',
  navy: '#06111f',
};

interface RevenueChartProps {
  data: Array<{ label: string; revenue: number }>;
  isLoading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Revenue Trend</span>
        <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Last 7 Days</span>
      </div>
      <div style={{ flex: 1, minHeight: 300, width: '100%', position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)', zIndex: 5, borderRadius: 8 }}>
            <div className="spinner" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.gold} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={CHART_COLORS.gold} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(val) => `$${val}`} />
            <RechartsTooltip
              formatter={(value: any) => [fmt(Number(value)), 'Revenue']}
              contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}
            />
            <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.gold} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
