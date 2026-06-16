import React from 'react';
import { StoreSettings } from 'types/settings';

interface StoreInfoTabProps {
  store: StoreSettings;
  set: (k: string, v: any) => void;
}

export const StoreInfoTab: React.FC<StoreInfoTabProps> = ({ store, set }) => (
  <div className="panel">
    <div className="panel-header"><span className="panel-title">Store Information</span></div>
    <div className="modal-body grid grid-cols-2 gap-[14px]">
      {[
        { key: 'name',    label: 'Store Name',     span: true },
        { key: 'address', label: 'Street Address',  span: true },
        { key: 'city',    label: 'City' },
        { key: 'state',   label: 'State (2-letter)' },
        { key: 'zip',     label: 'ZIP Code' },
        { key: 'phone',   label: 'Phone' },
        { key: 'email',   label: 'Store Email',    span: true },
      ].map(f => (
        <div key={f.key} className="input-group"
          style={f.span ? { gridColumn: '1/-1' } : {}}>
          <label>{f.label}</label>
          <input className="input" value={(store as any)[f.key] || ''}
            onChange={e => { set(f.key, e.target.value); }} />
        </div>
      ))}
    </div>
    <div className="section-divider my-4" />
    <div className="px-6 pb-5 grid grid-cols-3 gap-[14px]">
      <div className="input-group">
        <label>Currency</label>
        <select className="input" value={store.currency} onChange={e => { set('currency', e.target.value); }}>
          <option value="USD">USD — US Dollar</option>
          <option value="CAD">CAD — Canadian Dollar</option>
        </select>
      </div>
      <div className="input-group">
        <label>Timezone</label>
        <select className="input" value={store.timezone} onChange={e => { set('timezone', e.target.value); }}>
          {['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix'].map(tz => (
            <option key={tz} value={tz}>{tz.replace('America/','').replace('_',' ')}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);
