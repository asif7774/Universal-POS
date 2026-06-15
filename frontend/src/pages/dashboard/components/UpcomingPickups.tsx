import React from 'react';
import { UpcomingRental } from 'types/dashboard';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const UpcomingPickups: React.FC<{ rentals: UpcomingRental[] }> = ({ rentals }) => (
  <div className="panel">
    <div className="panel-header">
      <h2 className="panel-title">Upcoming Pickups</h2>
    </div>
    {rentals.map((r, i) => (
      <div key={i} className="table-row flex-col items-start gap-1">
        <div className="flex w-full items-center justify-between">
          <span className="text-[var(--text-primary)] font-semibold text-sm">{r.customer}</span>
          <span className="badge badge-gold text-[var(--text-muted)] text-xs">{r.date}</span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{r.item}</span>
        <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
          <SvgIcon name="location" width="12" height="12" aria-hidden="true" />
          {r.event}
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--status-success)] font-semibold">
          Deposit: {r.deposit}
          <SvgIcon name="check-circle" width="12" height="12" aria-hidden="true" />
        </div>
      </div>
    ))}
  </div>
);
