import React, { useState } from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { useSnackbar } from 'contexts/SnackbarContext';
import { apiClient } from '../../../lib/apiClient';

const PREFS_KEY = 'tuxedopos_security_prefs';

const CHECKBOX_OPTIONS = [
  { key: 'requirePin',             label: 'Require PIN for all cashier actions',          defaultChecked: true  },
  { key: 'autoLock',               label: 'Auto-lock POS after 5 minutes idle',           defaultChecked: true  },
  { key: 'requireManagerDiscount', label: 'Require manager approval for discounts > 20%', defaultChecked: true  },
  { key: 'requireManagerRefund',   label: 'Require manager approval for refunds',         defaultChecked: false },
  { key: 'logPriceOverrides',      label: 'Log all price overrides',                      defaultChecked: true  },
];

const loadPrefs = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) return JSON.parse(stored) as Record<string, boolean>;
  } catch { /**/ }
  return Object.fromEntries(CHECKBOX_OPTIONS.map(o => [o.key, o.defaultChecked]));
};

export const SecurityTab: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(loadPrefs);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const togglePref = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const updatePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showSnackbar('Please fill in all password fields.', 'error');
      return;
    }
    if (newPw !== confirmPw) {
      showSnackbar('New passwords do not match.', 'error');
      return;
    }
    if (newPw.length < 8) {
      showSnackbar('Password must be at least 8 characters.', 'error');
      return;
    }
    setChangingPw(true);
    try {
      await apiClient.post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      showSnackbar('Password updated successfully.', 'success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch {
      showSnackbar('Failed to update password. Check your current password.', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  const exportData = async () => {
    try {
      const blob = await fetch('/api/v1/admin/export', {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('tuxedopos_session') ?? '{}').access_token ?? ''}` },
      }).then(r => r.blob());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'tuxedopos-export.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      showSnackbar('Export failed. Contact your administrator.', 'error');
    }
  };

  const clearTestData = async () => {
    if (!window.confirm('This will permanently delete all test/sample data. This cannot be undone. Continue?')) return;
    try {
      await apiClient.post('/admin/clear-test-data', {});
      showSnackbar('Test data cleared successfully.', 'success');
    } catch {
      showSnackbar('Failed to clear test data.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SvgIcon name="lock" width="16" height="16" style={{ color: 'var(--tux-navy)' }} />
          <span className="card-title">Session & Access</span>
          <span className="ml-auto text-[0.7rem] text-text-muted">Saved on this device</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {CHECKBOX_OPTIONS.map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--surface-border)' }}>
              <input type="checkbox"
                checked={prefs[opt.key] ?? opt.defaultChecked}
                onChange={() => { togglePref(opt.key); }}
                style={{ width: 16, height: 16, accentColor: 'var(--tux-navy)', cursor: 'pointer' }} />
              <span style={{ fontSize: '.875rem' }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SvgIcon name="key" width="16" height="16" style={{ color: 'var(--tux-navy)' }} />
          <span className="card-title">Change Password</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="input-group" style={{ gridColumn: '1/-1' }}>
            <label className="input-label">Current Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={currentPw} onChange={e => { setCurrentPw(e.target.value); }} />
          </div>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <input className="input" type="password" placeholder="Min. 8 characters"
              value={newPw} onChange={e => { setNewPw(e.target.value); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Confirm New Password</label>
            <input className="input" type="password" placeholder="Repeat new password"
              value={confirmPw} onChange={e => { setConfirmPw(e.target.value); }} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={() => { void updatePassword(); }} disabled={changingPw}>
            {changingPw ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      <div className="card" style={{ border: '1px solid #FECACA' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SvgIcon name="warning" width="16" height="16" style={{ color: 'var(--status-error)' }} />
          <span className="card-title" style={{ color: 'var(--status-error)' }}>Danger Zone</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--surface-border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '.875rem' }}>Export All Data</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>Download a CSV export of all orders, customers, and inventory.</div>
            </div>
            <button className="btn btn-outline btn-sm" style={{ borderColor: '#FECACA', color: 'var(--status-error)' }}
              onClick={() => { void exportData(); }}>
              Export All Data
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--surface-border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '.875rem' }}>Clear Test Data</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>Remove all sample data. Cannot be undone.</div>
            </div>
            <button className="btn btn-outline btn-sm" style={{ borderColor: '#FECACA', color: 'var(--status-error)' }}
              onClick={() => { void clearTestData(); }}>
              Clear Test Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
