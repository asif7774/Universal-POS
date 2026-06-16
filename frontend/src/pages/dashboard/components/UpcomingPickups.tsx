import React from 'react';
import { UpcomingRental } from 'types/dashboard';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const UpcomingPickups: React.FC<{ rentals: UpcomingRental[] }> = ({ rentals }) => (
  <div className="panel">
    <div className="panel-header">
      <h2 className="panel-title">Upcoming Pickups</h2>
    </div>
    {rentals.map((r, i) => (
      <div key={i} className="flex flex-col gap-1.5 p-4 border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-panel-hover)] transition-colors">
        <div className="flex w-full items-center justify-between">
          <span className="text-[var(--text-primary)] font-bold text-[0.95rem]">{r.customer}</span>
          <span className="badge badge-gold text-[var(--text-muted)] text-xs">{r.date}</span>
        </div>
        <span className="text-sm text-[var(--text-secondary)]">{r.item}</span>
        <div className="flex items-center gap-1 text-[var(--text-muted)] text-sm">
          <SvgIcon name="location" width="14" height="14" aria-hidden="true" />
          {r.event}
        </div>
        <div className="flex items-center gap-1 text-sm text-[var(--status-success)] font-semibold mt-0.5">
          Deposit: {r.deposit}
          <SvgIcon name="check-circle" width="14" height="14" aria-hidden="true" />
        </div>
      </div>
    ))}
  </div>
);
