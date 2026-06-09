import React from 'react';
import { Link } from 'react-router-dom';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const QuickActions: React.FC = () => (
  <div className="card">
    <div className="card-title mb-3">Quick Actions</div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'New Rental', icon: 'rental', path: '/rentals', color: 'var(--tux-navy)' },
        { label: 'New Customer', icon: 'user', path: '/customers', color: 'var(--tux-navy)' },
        { label: 'Take Measurement', icon: 'measurements', path: '/measurements', color: 'var(--tux-navy)' },
        { label: 'New Appointment', icon: 'appointments', path: '/appointments', color: 'var(--tux-navy)' },
      ].map(a => (
        <Link key={a.label} to={a.path} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--surface-border)] bg-[var(--surface-hover)] cursor-pointer no-underline text-[var(--text-primary)] transition-all duration-150 text-[0.8rem] font-semibold hover:border-[var(--tux-navy)] hover:bg-[var(--surface-card)]">
          <div className="text-[var(--tux-navy)] opacity-80">
            <SvgIcon name={a.icon} width="22" height="22" />
          </div>
          {a.label}
        </Link>
      ))}
    </div>
  </div>
);
