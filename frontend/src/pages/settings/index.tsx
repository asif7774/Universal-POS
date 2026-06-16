import React, { useState, useEffect } from 'react';
import { usePlugins } from 'contexts/PluginContext';
import { useSnackbar } from 'contexts/SnackbarContext';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { useSettings, useUpdateSettings } from '../../lib/queries';
import { SettingsTabType, StoreSettings } from 'types/settings';
import { StoreInfoTab } from './components/StoreInfoTab';
import { StaffTab } from './components/StaffTab';
import { TaxesTab } from './components/TaxesTab';
import { ReceiptsTab } from './components/ReceiptsTab';
import { SecurityTab } from './components/SecurityTab';
import { usePageHeader } from 'contexts/PageHeaderContext';

// Fallback defaults used only while the API is loading or unavailable
const DEFAULT_SETTINGS: StoreSettings = {
  name: '', address: '', city: '', state: '', zip: '',
  phone: '', email: '', taxRate: '0', currency: 'USD',
  timezone: 'America/New_York', lateFeePerDay: '0',
  depositPct: '0', rentalBuffer: '0',
};

const Settings: React.FC = () => {
  const { getSettingsPages } = usePlugins();
  const { showSnackbar } = useSnackbar();
  const [tab, setTab] = useState('store');

  // ── API integration ──
  const { data: serverSettings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [store, setStore] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Sync server data into local form state when loaded
  useEffect(() => {
    if (serverSettings) {
      setStore(serverSettings);
    }
  }, [serverSettings]);

  const set = (k: string, v: string) => { setStore(s => ({ ...s, [k]: v })); };

  const save = () => {
    updateSettings.mutate(store, {
      onSuccess: () => showSnackbar('Settings saved successfully!', 'success'),
      onError: () => showSnackbar('Failed to save settings.', 'error'),
    });
  };

  const TABS: { id: SettingsTabType; label: string; icon: string }[] = [
    { id: 'store',    label: 'Store Info',  icon: 'home' },
    { id: 'staff',    label: 'Staff',       icon: 'users' },
    { id: 'taxes',    label: 'Taxes & Fees',icon: 'banknote' },
    { id: 'receipts', label: 'Receipts',    icon: 'printer'  },
    { id: 'security', label: 'Security',    icon: 'lock' },
    ...getSettingsPages().map(page => ({
      id: page.id,
      label: page.title,
      icon: 'settings' // Default icon for plugins
    }))
  ];

  const activePluginPage = getSettingsPages().find(p => p.id === tab);

  usePageHeader({
    title: 'Settings',
    subtitle: `${store.name || 'TuxedoPOS'} · Configure your store`,
    actions: tab !== 'staff' && tab !== 'receipts' && tab !== 'security' ? (
      <button className="btn btn-gold flex items-center gap-[6px]" onClick={save} disabled={updateSettings.isPending}>
        {updateSettings.isPending ? 'Saving...' : updateSettings.isSuccess ? (
          <>
            <SvgIcon name="check-circle" width="14" height="14" /> Saved!
          </>
        ) : 'Save Changes'}
      </button>
    ) : undefined,
  });

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <div className="p-10 text-center text-[var(--text-muted)]">Loading settings...</div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: '220px 1fr' }}>
          {/* Sidebar nav */}
          <div className="panel p-2 self-start">
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); }}
                className="flex items-center gap-[10px] w-full py-[10px] px-3 border-none rounded-[var(--radius-md)] cursor-pointer text-sm transition-all duration-[150ms] text-left mb-0.5"
                style={{
                  background: tab === t.id ? 'var(--accent-gold)' : 'transparent',
                  color: tab === t.id ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                  fontWeight: tab === t.id ? 700 : 500,
                }}>
                <SvgIcon name={t.icon} width="16" height="16" /> {t.label}
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
              <div className="panel">
                <div className="panel-header flex items-center gap-[10px]">
                  <SvgIcon name="settings" width="18" height="18" className="text-[var(--accent-gold-text)]" />
                  <span className="panel-title">{activePluginPage.title}</span>
                </div>
                {activePluginPage.component}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
