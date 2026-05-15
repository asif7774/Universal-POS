import React from 'react';
import { StatProps } from 'types/dashboard';
import { Sparkline } from './Sparkline';

export const StatCard: React.FC<StatProps> = ({ label, value, change, positive, sparkData, color, icon }) => (
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
