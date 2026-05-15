import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { fmt } from 'constants/reports';

interface CategorySalesChartProps {
  data: Array<{ name: string; value: number }>;
  isLoading?: boolean;
}

export const CategorySalesChart: React.FC<CategorySalesChartProps> = ({ data, isLoading }) => {
  return (
    <div className="card" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <span className="card-title">Sales by Category</span>
      </div>
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', zIndex: 5, borderRadius: 8 }}>
            <div className="spinner" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--surface-border)" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <RechartsTooltip formatter={(value: any) => fmt(Number(value))} cursor={{ fill: 'var(--surface-hover)' }} />
            <Bar dataKey="value" fill="var(--tux-gold)" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
