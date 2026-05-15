import React from 'react';
import { StoreSettings } from 'types/settings';

interface StoreInfoTabProps {
  store: StoreSettings;
  set: (k: string, v: string) => void;
}

export const StoreInfoTab: React.FC<StoreInfoTabProps> = ({ store, set }) => (
  <div className="card">
    <div className="card-header"><span className="card-title">🏪 Store Information</span></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {[
        { key: 'name',    label: 'Store Name',   span: true },
        { key: 'address', label: 'Street Address', span: true },
        { key: 'city',    label: 'City' },
        { key: 'state',   label: 'State (2-letter)' },
        { key: 'zip',     label: 'ZIP Code' },
        { key: 'phone',   label: 'Phone' },
        { key: 'email',   label: 'Store Email', span: true },
      ].map(f => (
        <div key={f.key} className="input-group"
          style={f.span ? { gridColumn: '1/-1' } : {}}>
          <label className="input-label">{f.label}</label>
          <input className="input" value={(store as Record<string,string>)[f.key]}
            onChange={e => { set(f.key, e.target.value); }} />
        </div>
      ))}
    </div>
    <div className="divider" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
      <div className="input-group">
        <label className="input-label">Currency</label>
        <select className="input" value={store.currency} onChange={e => { set('currency', e.target.value); }}>
          <option value="USD">USD — US Dollar</option>
          <option value="CAD">CAD — Canadian Dollar</option>
        </select>
      </div>
      <div className="input-group">
        <label className="input-label">Timezone</label>
        <select className="input" value={store.timezone} onChange={e => { set('timezone', e.target.value); }}>
          {['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix'].map(tz => (
            <option key={tz} value={tz}>{tz.replace('America/','').replace('_',' ')}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);
