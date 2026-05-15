import React from 'react';

export const QuickActions: React.FC = () => (
  <div className="card">
    <div className="card-title" style={{ marginBottom: 12 }}>Quick Actions</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[
        { label: 'New Rental', icon: '🎩', path: '/rentals/new', color: 'var(--tux-navy)' },
        { label: 'New Customer', icon: '👤', path: '/customers/new', color: 'var(--tux-navy)' },
        { label: 'Take Measurement', icon: '📐', path: '/measurements/new', color: 'var(--tux-navy)' },
        { label: 'New Appointment', icon: '📅', path: '/appointments/new', color: 'var(--tux-navy)' },
      ].map(a => (
        <a key={a.label} href={a.path} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          padding: '12px 8px', borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--surface-border)',
          background: 'var(--surface-hover)', cursor: 'pointer',
          textDecoration: 'none', color: 'var(--text-primary)',
          transition: 'all .15s', fontSize: '.8rem', fontWeight: 600,
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--tux-navy)'; (e.currentTarget as HTMLElement).style.background = '#EEF2F8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
        >
          <span style={{ fontSize: '1.3rem' }}>{a.icon}</span>
          {a.label}
        </a>
      ))}
    </div>
  </div>
);
