import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { fmt, COLORS } from 'constants/reports';

interface PaymentMethodsChartProps {
  data: Array<{ name: string; value: number }>;
  isLoading?: boolean;
}

export const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ data, isLoading }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <span className="card-title">Payment Methods</span>
      </div>
      <div style={{ flex: 1, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', zIndex: 5, borderRadius: 8 }}>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value: any) => fmt(Number(value))} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
