import React from 'react';
import { RentalFleetItem } from 'types/dashboard';

export const RentalFleetStatus: React.FC<{ fleet: RentalFleetItem[] }> = ({ fleet }) => (
  <div className="card">
    <div className="card-title" style={{ marginBottom: 12 }}>Rental Fleet Status</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {fleet.map(r => (
        <div key={r.status}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.8rem' }}>
            <span style={{ fontWeight: 500 }}>{r.status}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{r.count}</span>
          </div>
          <div style={{ height: 6, background: 'var(--surface-border)', borderRadius: 999 }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${(r.count / r.total) * 100}%`,
              background: r.status === 'Available' ? 'var(--status-success)' :
                r.status === 'Out' ? 'var(--tux-navy)' :
                r.status === 'Overdue' ? 'var(--status-error)' : 'var(--tux-gold)',
              transition: 'width .3s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
