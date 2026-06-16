import React from 'react';
import { StoreSettings } from 'types/settings';

interface TaxesTabProps {
  store: StoreSettings;
  set: (k: string, v: string) => void;
}

export const TaxesTab: React.FC<TaxesTabProps> = ({ store, set }) => (
  <div className="panel">
    <div className="panel-header"><span className="panel-title">Tax &amp; Fee Configuration</span></div>
    <div className="modal-body grid grid-cols-2 gap-[14px]">
      {[
        { key: 'taxRate',        label: 'Sales Tax Rate (%)',         hint: 'Applied to all taxable items. NY default: 8.875%' },
        { key: 'lateFeePerDay', label: 'Late Return Fee (per day)',  hint: 'Charged each day a rental is overdue.' },
        { key: 'depositPct',     label: 'Security Deposit (%)',       hint: '% of rental total charged as deposit.' },
        { key: 'rentalBuffer',   label: 'Return Buffer (days)',       hint: 'Grace days before late fee kicks in.' },
      ].map(f => (
        <div key={f.key} className="input-group">
          <label>{f.label}</label>
          <input className="input" type="number" step="0.001"
            value={(store as Record<string, string>)[f.key]}
            onChange={e => { set(f.key, e.target.value); }} />
          <p className="text-[.72rem] text-[var(--text-muted)] mt-1">{f.hint}</p>
        </div>
      ))}
    </div>
    <div className="section-divider my-2" />
    <div className="mt-0 mx-6 mb-5 py-3 px-4 bg-[var(--bg-panel-hover)] rounded-[var(--radius-md)] text-[.85rem] border border-[var(--border-subtle)]">
      <div className="font-bold mb-2 text-[var(--text-primary)]">Preview — $100 rental for 3 days</div>
      <div className="flex flex-col gap-1">
        {[
          ['Subtotal', '$100.00'],
          [`Tax (${store.taxRate}%)`, `$${(100 * parseFloat(store.taxRate) / 100).toFixed(2)}`],
          [`Deposit (${store.depositPct}%)`, `$${(100 * parseFloat(store.depositPct) / 100).toFixed(2)}`],
          ['Total Due', `$${(100 + 100 * parseFloat(store.taxRate) / 100).toFixed(2)}`],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between">
            <span className="text-[var(--text-secondary)]">{l}</span>
            <span className="font-bold text-[var(--text-primary)]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
