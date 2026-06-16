import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { fmt } from 'constants/reports';

const CHART_COLORS = {
  gold: '#c9a84c',
  emerald: '#3d9970',
  error: '#f87171',
  navy: '#06111f',
};

const PIE_COLORS = [CHART_COLORS.gold, CHART_COLORS.emerald, CHART_COLORS.navy, CHART_COLORS.error];

interface PaymentMethodsChartProps {
  data: Array<{ name: string; value: number }>;
  isLoading?: boolean;
}

export const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ data, isLoading }) => {
  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Payment Methods</span>
      </div>
      <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/15 z-[5] rounded-lg">
            <div className="spinner" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: any) => fmt(Number(value))}
              contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}
            />
            <Legend verticalAlign="bottom" height={60} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
