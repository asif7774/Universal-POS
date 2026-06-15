import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { fmt } from 'constants/reports';

const CHART_COLORS = {
  gold: '#c9a84c',
  emerald: '#3d9970',
  error: '#f87171',
  navy: '#06111f',
};

interface CategorySalesChartProps {
  data: Array<{ name: string; value: number }>;
  isLoading?: boolean;
}

export const CategorySalesChart: React.FC<CategorySalesChartProps> = ({ data, isLoading }) => {
  return (
    <div className="panel" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Sales by Category</span>
      </div>
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)', zIndex: 5, borderRadius: 8 }}>
            <div className="spinner" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(val) => `$${val}`} />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
            <RechartsTooltip
              formatter={(value: any) => fmt(Number(value))}
              cursor={{ fill: 'var(--bg-panel-hover)' }}
              contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}
            />
            <Bar dataKey="value" fill={CHART_COLORS.emerald} radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
