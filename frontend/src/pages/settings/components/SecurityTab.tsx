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
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-header flex items-center gap-[10px]">
          <SvgIcon name="lock" width="16" height="16" className="text-[var(--accent-gold-text)]" />
          <span className="card-title">Session & Access</span>
          <span className="ml-auto text-[0.7rem] text-text-muted">Saved on this device</span>
        </div>
        <div className="flex flex-col gap-[14px]">
          {CHECKBOX_OPTIONS.map(opt => (
            <label key={opt.key} className="flex items-center gap-3 cursor-pointer py-2 border-b border-[var(--border-subtle)]">
              <input type="checkbox"
                checked={prefs[opt.key] ?? opt.defaultChecked}
                onChange={() => { togglePref(opt.key); }}
                className="w-4 h-4 accent-[var(--accent-gold-text)] cursor-pointer" />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center gap-[10px]">
          <SvgIcon name="key" width="16" height="16" className="text-[var(--accent-gold-text)]" />
          <span className="card-title">Change Password</span>
        </div>
        <div className="grid grid-cols-2 gap-[14px]">
          <div className="input-group col-span-full">
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
        <div className="mt-[14px]">
          <button className="btn btn-gold" onClick={() => { void updatePassword(); }} disabled={changingPw}>
            {changingPw ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      <div className="card border border-[#FECACA]">
        <div className="card-header flex items-center gap-[10px]">
          <SvgIcon name="warning" width="16" height="16" className="text-[var(--status-error)]" />
          <span className="card-title text-[var(--status-error)]">Danger Zone</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center py-[10px] border-b border-[var(--border-subtle)]">
            <div>
              <div className="font-semibold text-sm">Export All Data</div>
              <div className="text-[.78rem] text-[var(--text-muted)]">Download a CSV export of all orders, customers, and inventory.</div>
            </div>
            <button className="btn btn-outline btn-sm border-[#FECACA] text-[var(--status-error)]"
              onClick={() => { void exportData(); }}>
              Export All Data
            </button>
          </div>
          <div className="flex justify-between items-center py-[10px] border-b border-[var(--border-subtle)]">
            <div>
              <div className="font-semibold text-sm">Clear Test Data</div>
              <div className="text-[.78rem] text-[var(--text-muted)]">Remove all sample data. Cannot be undone.</div>
            </div>
            <button className="btn btn-outline btn-sm border-[#FECACA] text-[var(--status-error)]"
              onClick={() => { void clearTestData(); }}>
              Clear Test Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
