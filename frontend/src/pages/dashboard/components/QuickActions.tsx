import React from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const QuickActions: React.FC = () => (
  <div className="card">
    <div className="card-title mb-3">Quick Actions</div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'New Rental', icon: 'rental', path: '/rentals/new', color: 'var(--tux-navy)' },
        { label: 'New Customer', icon: 'user', path: '/customers/new', color: 'var(--tux-navy)' },
        { label: 'Take Measurement', icon: 'measurements', path: '/measurements/new', color: 'var(--tux-navy)' },
        { label: 'New Appointment', icon: 'appointments', path: '/appointments/new', color: 'var(--tux-navy)' },
      ].map(a => (
        <a key={a.label} href={a.path} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--surface-border)] bg-[var(--surface-hover)] cursor-pointer no-underline text-[var(--text-primary)] transition-all duration-150 text-[0.8rem] font-semibold hover:border-[var(--tux-navy)] hover:bg-[#EEF2F8]">
          <div className="text-[var(--tux-navy)] opacity-80">
            <SvgIcon name={a.icon} width="22" height="22" />
          </div>
          {a.label}
        </a>
      ))}
    </div>
  </div>
);
