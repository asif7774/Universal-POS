import React from 'react';

export const SecurityTab: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div className="card">
      <div className="card-header"><span className="card-title">🔐 Session & Access</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Require PIN for all cashier actions', defaultChecked: true },
          { label: 'Auto-lock POS after 5 minutes idle', defaultChecked: true },
          { label: 'Require manager approval for discounts > 20%', defaultChecked: true },
          { label: 'Require manager approval for refunds', defaultChecked: false },
          { label: 'Log all price overrides', defaultChecked: true },
        ].map(opt => (
          <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--surface-border)' }}>
            <input type="checkbox" defaultChecked={opt.defaultChecked}
              style={{ width: 16, height: 16, accentColor: 'var(--tux-navy)', cursor: 'pointer' }} />
            <span style={{ fontSize: '.875rem' }}>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="card">
      <div className="card-header"><span className="card-title">🔑 Change Password</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="input-group" style={{ gridColumn: '1/-1' }}>
          <label className="input-label">Current Password</label>
          <input className="input" type="password" placeholder="••••••••" />
        </div>
        <div className="input-group">
          <label className="input-label">New Password</label>
          <input className="input" type="password" placeholder="Min. 8 characters" />
        </div>
        <div className="input-group">
          <label className="input-label">Confirm New Password</label>
          <input className="input" type="password" placeholder="Repeat new password" />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <button className="btn btn-primary">Update Password</button>
      </div>
    </div>

    <div className="card" style={{ border: '1px solid #FECACA' }}>
      <div className="card-header"><span className="card-title" style={{ color: 'var(--status-error)' }}>⚠️ Danger Zone</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: 'Export All Data', desc: 'Download a CSV export of all orders, customers, and inventory.' },
          { label: 'Clear Test Data', desc: 'Remove all sample data. Cannot be undone.' },
        ].map(a => (
          <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--surface-border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{a.label}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{a.desc}</div>
            </div>
            <button className="btn btn-outline btn-sm" style={{ borderColor: '#FECACA', color: 'var(--status-error)' }}>{a.label}</button>
          </div>
        ))}
      </div>
    </div>
  </div>
);
