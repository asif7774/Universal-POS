import React from 'react';

export const ReceiptsTab: React.FC = () => (
  <div className="card">
    <div className="card-header"><span className="card-title">🖨️ Receipt Configuration</span></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[
        { label: 'Print receipt after every sale', defaultChecked: true },
        { label: 'Print receipt after rental checkout', defaultChecked: true },
        { label: 'Show store logo on receipt', defaultChecked: true },
        { label: 'Show tax breakdown on receipt', defaultChecked: true },
        { label: 'Include return date reminder on rental receipt', defaultChecked: true },
        { label: 'Email receipt to customer automatically', defaultChecked: false },
        { label: 'Print alteration/job ticket for tailoring orders', defaultChecked: true },
      ].map(opt => (
        <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--surface-border)' }}>
          <input type="checkbox" defaultChecked={opt.defaultChecked}
            style={{ width: 16, height: 16, accentColor: 'var(--tux-navy)', cursor: 'pointer' }} />
          <span style={{ fontSize: '.875rem' }}>{opt.label}</span>
        </label>
      ))}
      <div className="input-group">
        <label className="input-label">Receipt Footer Message</label>
        <textarea className="input" rows={2} style={{ resize: 'vertical' }}
          defaultValue="Thank you for choosing TuxedoPOS! Please return all items on time to avoid late fees." />
      </div>
    </div>
  </div>
);
