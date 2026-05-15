import React, { useState } from 'react';
import { usePlugins } from 'contexts/PluginContext';

type SettingsTab = string;

interface StaffMember {
  id: string; name: string; email: string; role: 'owner' | 'manager' | 'cashier';
  isActive: boolean; lastLogin: string; pin?: string;
}

const STAFF: StaffMember[] = [
  { id: 'u1', name: 'James Miller',  email: 'admin@tuxedopos.com',   role: 'owner',   isActive: true, lastLogin: 'Today 3:47 AM' },
  { id: 'u2', name: 'Sarah Connor',  email: 'manager@tuxedopos.com', role: 'manager', isActive: true, lastLogin: 'Today 2:10 AM' },
  { id: 'u3', name: 'Tom Baker',     email: 'cashier@tuxedopos.com', role: 'cashier', isActive: true, lastLogin: 'Yesterday',    pin: '••••••' },
  { id: 'u4', name: 'Tony Russo',    email: 'tony@tuxedopos.com',    role: 'cashier', isActive: false, lastLogin: '3 days ago',  pin: '••••••' },
];

const ROLE_BADGE: Record<string, string> = { owner: 'badge-gold', manager: 'badge-navy', cashier: 'badge-gray' };

const Settings: React.FC = () => {
  const { getSettingsPages } = usePlugins();
  const [tab, setTab] = useState<SettingsTab>('store');
  const [saved, setSaved] = useState(false);
  const [store, setStore] = useState({
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

  const TABS: { id: SettingsTab; label: string; icon: string }[] = [
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
          {/* ── Store Info ── */}
          {tab === 'store' && (
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
                      onChange={e => set(f.key, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Currency</label>
                  <select className="input" value={store.currency} onChange={e => set('currency', e.target.value)}>
                    <option value="USD">USD — US Dollar</option>
                    <option value="CAD">CAD — Canadian Dollar</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Timezone</label>
                  <select className="input" value={store.timezone} onChange={e => set('timezone', e.target.value)}>
                    {['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix'].map(tz => (
                      <option key={tz} value={tz}>{tz.replace('America/','').replace('_',' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Staff ── */}
          {tab === 'staff' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)' }}>
                <span className="card-title">👥 Staff Members</span>
                <button className="btn btn-gold btn-sm">+ Add Staff</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>PIN</th><th>Last Login</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {STAFF.map(s => (
                    <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.5 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: '.7rem', background: s.role === 'owner' ? 'var(--tux-gold)' : 'var(--tux-navy)' }}>
                            {s.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                      <td><span className={`badge ${ROLE_BADGE[s.role]}`} style={{ textTransform: 'capitalize' }}>{s.role}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '.85rem' }}>{s.pin ?? '—'}</td>
                      <td style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{s.lastLogin}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 600,
                          color: s.isActive ? 'var(--status-success)' : 'var(--text-muted)' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.isActive ? 'var(--status-success)' : '#94A3B8' }} />
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Taxes & Fees ── */}
          {tab === 'taxes' && (
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
                      onChange={e => set(f.key, e.target.value)} />
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
          )}

          {/* ── Receipts ── */}
          {tab === 'receipts' && (
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
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
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
          )}

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
