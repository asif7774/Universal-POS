import React from 'react';
import { RentalFleetItem } from 'types/dashboard';

const STATUS_FILL: Record<string, string> = {
  Available: 'progress-fill-emerald',
  Out:       'progress-fill-gold',
  Overdue:   'progress-fill-error',
  Booked:    'progress-fill-neutral',
};

export const RentalFleetStatus: React.FC<{ fleet: RentalFleetItem[] }> = ({ fleet }) => (
  <div className="panel">
    <div className="panel-header">
      <h2 className="panel-title">Rental Fleet Status</h2>
    </div>
    <div className="p-4 flex flex-col gap-4">
      {fleet.map(r => (
        <div key={r.status}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{r.status}</span>
            <span className="text-xs text-[var(--text-muted)]">{r.count} / {r.total}</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${STATUS_FILL[r.status] ?? 'progress-fill-neutral'}`}
              style={{ width: `${r.total > 0 ? Math.round((r.count / r.total) * 100) : 0}%` }}
              role="progressbar"
              aria-valuenow={r.count}
              aria-valuemin={0}
              aria-valuemax={r.total}
              aria-label={`${r.status} fleet items`}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);
