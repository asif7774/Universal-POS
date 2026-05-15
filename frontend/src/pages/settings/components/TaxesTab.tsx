import React from 'react';
import { StoreSettings } from 'types/settings';

interface TaxesTabProps {
  store: StoreSettings;
  set: (k: string, v: string) => void;
}

export const TaxesTab: React.FC<TaxesTabProps> = ({ store, set }) => (
  <div className="card">
    <div className="card-header"><span className="card-title">💰 Tax & Fee Configuration</span></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {[
        { key: 'taxRate',         label: 'Sales Tax Rate (%)',          hint: 'Applied to all taxable items. NY default: 8.875%' },
        { key: 'lateFeePerDay',  label: 'Late Return Fee (per day)',   hint: 'Charged each day a rental is overdue.' },
        { key: 'depositPct',      label: 'Security Deposit (%)',        hint: '% of rental total charged as deposit.' },
        { key: 'rentalBuffer',    label: 'Return Buffer (days)',        hint: 'Grace days before late fee kicks in.' },
      ].map(f => (
        <div key={f.key} className="input-group">
          <label className="input-label">{f.label}</label>
          <input className="input" type="number" step="0.001"
            value={(store as Record<string,string>)[f.key]}
            onChange={e => { set(f.key, e.target.value); }} />
          <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{f.hint}</p>
        </div>
      ))}
    </div>
    <div className="divider" />
    <div style={{ padding: '12px 16px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', fontSize: '.85rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>💡 Preview — $100 rental for 3 days</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          ['Subtotal', '$100.00'],
          [`Tax (${store.taxRate}%)`, `$${(100 * parseFloat(store.taxRate) / 100).toFixed(2)}`],
          [`Deposit (${store.depositPct}%)`, `$${(100 * parseFloat(store.depositPct) / 100).toFixed(2)}`],
          ['Total Due', `$${(100 + 100 * parseFloat(store.taxRate) / 100).toFixed(2)}`],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
            <span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
