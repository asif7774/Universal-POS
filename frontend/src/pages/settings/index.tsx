import React, { useState } from 'react';
import { usePlugins } from 'contexts/PluginContext';
import { SettingsTabType, StoreSettings } from './types';
import { StoreInfoTab } from './components/StoreInfoTab';
import { StaffTab } from './components/StaffTab';
import { TaxesTab } from './components/TaxesTab';
import { ReceiptsTab } from './components/ReceiptsTab';
import { SecurityTab } from './components/SecurityTab';

const Settings: React.FC = () => {
  const { getSettingsPages } = usePlugins();
  const [tab, setTab] = useState<SettingsTabType>('store');
  const [saved, setSaved] = useState(false);
  const [store, setStore] = useState<StoreSettings>({
    name: 'TuxedoPOS HQ',
    address: '123 Fifth Avenue',
    city: 'New York', state: 'NY', zip: '10001',
    phone: '(212) 555-0100',
    email: 'contact@tuxedopos.com',
    taxRate: '8.875',
    currency: 'USD',
    timezone: 'America/New_York',
    lateFeePerDay: '25',
    depositPct: '30',
    rentalBuffer: '1',
  });

  const set = (k: string, v: string) => setStore(s => ({ ...s, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const TABS: { id: SettingsTabType; label: string; icon: string }[] = [
    { id: 'store',    label: 'Store Info',  icon: '🏪' },
    { id: 'staff',    label: 'Staff',       icon: '👥' },
    { id: 'taxes',    label: 'Taxes & Fees',icon: '💰' },
    { id: 'receipts', label: 'Receipts',    icon: '🖨️'  },
    { id: 'security', label: 'Security',    icon: '🔐' },
    ...getSettingsPages().map(page => ({
      id: page.id,
      label: page.title,
      icon: '🔌' // Default icon for plugins
    }))
  ];

  const activePluginPage = getSettingsPages().find(p => p.id === tab);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">TuxedoPOS HQ · Configure your store</p>
        </div>
        {tab !== 'staff' && (
          <button className="btn btn-gold" onClick={save}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Sidebar nav */}
        <div className="card" style={{ padding: 8, alignSelf: 'start' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 12px', border: 'none', borderRadius: 'var(--radius-md)',
                background: tab === t.id ? 'var(--tux-navy)' : 'transparent',
                color: tab === t.id ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '.875rem', fontWeight: tab === t.id ? 700 : 500,
                transition: 'all .15s', textAlign: 'left', marginBottom: 2,
              }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === 'store' && <StoreInfoTab store={store} set={set} />}
          {tab === 'staff' && <StaffTab />}
          {tab === 'taxes' && <TaxesTab store={store} set={set} />}
          {tab === 'receipts' && <ReceiptsTab />}
          {tab === 'security' && <SecurityTab />}

          {/* ── Plugin Settings ── */}
          {activePluginPage && (
            <div className="card">
              <div className="card-header"><span className="card-title">🔌 {activePluginPage.title}</span></div>
              {activePluginPage.component}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
