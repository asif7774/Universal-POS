import React from 'react';
import { UpcomingRental } from 'types/dashboard';

export const UpcomingPickups: React.FC<{ rentals: UpcomingRental[] }> = ({ rentals }) => (
  <div className="card">
    <div className="card-title" style={{ marginBottom: 12 }}>Upcoming Pickups</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rentals.map((r, i) => (
        <div key={i} style={{
          padding: '10px 12px',
          background: 'var(--surface-hover)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid var(--tux-gold)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: '.875rem' }}>{r.customer}</span>
            <span className="badge badge-gold">{r.date}</span>
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{r.item}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>📍 {r.event}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--status-success)', marginTop: 4, fontWeight: 600 }}>
            Deposit: {r.deposit} ✓
          </div>
        </div>
      ))}
    </div>
  </div>
);
