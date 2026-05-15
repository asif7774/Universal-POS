import React from 'react';
import { UpcomingRental } from 'types/dashboard';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const UpcomingPickups: React.FC<{ rentals: UpcomingRental[] }> = ({ rentals }) => (
  <div className="card">
    <div className="card-title mb-3">Upcoming Pickups</div>
    <div className="flex flex-col gap-3">
      {rentals.map((r, i) => (
        <div key={i} className="p-2.5 px-3 bg-[var(--surface-hover)] rounded-[var(--radius-md)] border-l-3 border-[var(--tux-gold)]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-[0.875rem]">{r.customer}</span>
            <span className="badge badge-gold">{r.date}</span>
          </div>
          <div className="text-[0.78rem] text-[var(--text-secondary)] mb-0.5">{r.item}</div>
          <div className="text-[0.75rem] text-[var(--text-muted)] flex items-center gap-1">
            <SvgIcon name="location" width="12" height="12" /> {r.event}
          </div>
          <div className="text-[0.75rem] text-[var(--status-success)] mt-1 font-semibold flex items-center gap-1">
            Deposit: {r.deposit} <SvgIcon name="check-circle" width="12" height="12" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
