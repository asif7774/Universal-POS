import React from 'react';
import { StatProps } from 'types/dashboard';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { Sparkline } from './Sparkline';

const ICON_BG: Record<string, string> = {
  gold:    'bg-[var(--accent-gold-subtle)] text-[var(--accent-gold-text)]',
  emerald: 'bg-[var(--accent-emerald-subtle)] text-[var(--accent-emerald-text)]',
  error:   'bg-[var(--status-error-subtle)] text-[var(--status-error)]',
  primary: 'bg-[rgba(255,255,255,0.07)] text-[var(--text-secondary)]',
};

export const StatCard: React.FC<StatProps> = ({ label, value, change, positive, sparkData, colorVariant = 'primary', icon }) => (
  <div className="stat-card" role="region" aria-label={`${label} KPI`}>
    <div className="flex justify-between items-start mb-2">
      <p className="stat-label">{label}</p>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_BG[colorVariant] ?? ICON_BG.primary}`} aria-hidden="true">
        <SvgIcon name={icon} width="18" height="18" />
      </div>
    </div>
    <p className={`stat-value stat-value-${colorVariant}`}>{value}</p>
    {change && (
      <span className={`badge ${positive ? 'badge-success' : 'badge-error'}`}>
        <span aria-hidden="true">{positive ? '↑' : '↓'}</span>
        <span className="sr-only">{positive ? 'up' : 'down'}</span>
        {change}
        <span className="font-normal opacity-80 text-[0.7rem]"> vs last week</span>
      </span>
    )}
    {sparkData && sparkData.length > 1 && (
      <div className="mt-3 h-8">
        <Sparkline data={sparkData} colorVariant={colorVariant} />
      </div>
    )}
  </div>
);
