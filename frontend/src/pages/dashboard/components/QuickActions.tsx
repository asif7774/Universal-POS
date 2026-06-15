import React from 'react';
import { Link } from 'react-router-dom';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const QuickActions: React.FC = () => (
  <div className="panel">
    <div className="panel-header">
      <h2 className="panel-title">Quick Actions</h2>
    </div>
    <div className="p-4 grid grid-cols-2 gap-3">
      {[
        { label: 'New Rental',        icon: 'rental',       path: '/rentals' },
        { label: 'New Customer',      icon: 'user',         path: '/customers' },
        { label: 'Take Measurement',  icon: 'measurements', path: '/measurements' },
        { label: 'New Appointment',   icon: 'appointments', path: '/appointments' },
      ].map(a => (
        <Link
          key={a.label}
          to={a.path}
          className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-panel-hover)] hover:bg-[var(--bg-input)] transition-colors min-h-[44px] border border-[var(--border-subtle)] no-underline"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--accent-gold-subtle)] text-[var(--accent-gold-text)]" aria-hidden="true">
            <SvgIcon name={a.icon} width="16" height="16" />
          </div>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{a.label}</span>
        </Link>
      ))}
    </div>
  </div>
);
