import React, { useState } from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { HAL } from '../../../lib/hardware';
import { useSnackbar } from 'contexts/SnackbarContext';

const PREFS_KEY = 'tuxedopos_receipt_prefs';
const FOOTER_KEY = 'tuxedopos_receipt_footer';
const DEFAULT_FOOTER = 'Thank you for choosing TuxedoPOS! Please return all items on time to avoid late fees.';

const CHECKBOX_OPTIONS = [
  { key: 'printAfterSale',         label: 'Print receipt after every sale',                         defaultChecked: true  },
  { key: 'printAfterRental',       label: 'Print receipt after rental checkout',                    defaultChecked: true  },
  { key: 'showLogo',               label: 'Show store logo on receipt',                             defaultChecked: true  },
  { key: 'showTaxBreakdown',       label: 'Show tax breakdown on receipt',                          defaultChecked: true  },
  { key: 'includeReturnReminder',  label: 'Include return date reminder on rental receipt',         defaultChecked: true  },
  { key: 'emailReceiptAuto',       label: 'Email receipt to customer automatically',                defaultChecked: false },
  { key: 'printJobTicket',         label: 'Print alteration/job ticket for tailoring orders',       defaultChecked: true  },
];

const loadPrefs = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) return JSON.parse(stored) as Record<string, boolean>;
  } catch { /**/ }
  return Object.fromEntries(CHECKBOX_OPTIONS.map(o => [o.key, o.defaultChecked]));
};

export const ReceiptsTab: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [hwStatus, setHwStatus] = useState(HAL.getStatus());
  const [testing, setTesting] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(loadPrefs);
  const [footer, setFooter] = useState(() => localStorage.getItem(FOOTER_KEY) ?? DEFAULT_FOOTER);

  const refreshStatus = () => setHwStatus(HAL.getStatus());

  const togglePref = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const saveFooter = () => {
    localStorage.setItem(FOOTER_KEY, footer);
    showSnackbar('Receipt footer saved.', 'success');
  };

  const testPrint = async () => {
    setTesting('printer');
    await HAL.printReceipt("TuxedoPOS HARDWARE TEST\n-----------------------\nPrinter: " + hwStatus.printer.model + "\nStatus: ONLINE");
    showSnackbar('Test receipt sent to printer', 'success');
    setTesting(null);
  };

  const connectScanner = async () => {
    setTesting('scanner');
    await HAL.connectScanner();
    refreshStatus();
    showSnackbar('Barcode scanner connected', 'success');
    setTesting(null);
  };

  const kickDrawer = async () => {
    setTesting('drawer');
    const success = await HAL.openCashDrawer();
    if (success) {
      showSnackbar('Cash drawer kicked', 'success');
    } else {
      showSnackbar('Cash drawer not connected', 'error');
    }
    setTesting(null);
  };

  const connectPrinter = async () => {
    setTesting('printer');
    await HAL.connectPrinter();
    refreshStatus();
    showSnackbar('Receipt printer connected', 'success');
    setTesting(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SvgIcon name="printer" width="16" height="16" style={{ color: 'var(--tux-navy)' }} />
          <span className="card-title">Receipt Configuration</span>
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
          <div className="input-group">
            <label className="input-label">Receipt Footer Message</label>
            <textarea className="input" rows={2} style={{ resize: 'vertical' }}
              value={footer}
              onChange={e => { setFooter(e.target.value); }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
              <button className="btn btn-sm btn-outline" onClick={saveFooter}>Save Footer</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SvgIcon name="wrench" width="16" height="16" style={{ color: 'var(--tux-gold)' }} />
          <span className="card-title">Hardware Diagnostics</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Printer */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface-bg border border-surface-border">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hwStatus.printer.connected ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                <SvgIcon name="printer" width="16" height="16" />
              </div>
              <div>
                <div className="text-[0.875rem] font-bold">Receipt Printer</div>
                <div className="text-[0.7rem] text-text-muted">{hwStatus.printer.connected ? hwStatus.printer.model : 'Disconnected'}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {hwStatus.printer.connected ? (
                <button className="btn btn-sm btn-outline" onClick={testPrint} disabled={!!testing}>
                  {testing === 'printer' ? 'Printing...' : 'Test Print'}
                </button>
              ) : (
                <button className="btn btn-sm btn-gold" onClick={connectPrinter} disabled={!!testing}>
                  {testing === 'printer' ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          </div>

          {/* Scanner */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface-bg border border-surface-border">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hwStatus.scanner.connected ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                <SvgIcon name="search" width="16" height="16" />
              </div>
              <div>
                <div className="text-[0.875rem] font-bold">Barcode Scanner</div>
                <div className="text-[0.7rem] text-text-muted">{hwStatus.scanner.connected ? `${hwStatus.scanner.model} (${hwStatus.scanner.batteryLevel}% Battery)` : 'Disconnected'}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {!hwStatus.scanner.connected && (
                <button className="btn btn-sm btn-gold" onClick={connectScanner} disabled={!!testing}>
                  {testing === 'scanner' ? 'Connecting...' : 'Connect'}
                </button>
              )}
              {hwStatus.scanner.connected && (
                <div className="text-[0.7rem] text-status-success font-bold px-3 py-1 bg-status-success/10 rounded-full">ACTIVE</div>
              )}
            </div>
          </div>

          {/* Cash Drawer */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface-bg border border-surface-border">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hwStatus.cashDrawer.connected ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                <SvgIcon name="banknote" width="16" height="16" />
              </div>
              <div>
                <div className="text-[0.875rem] font-bold">Cash Drawer</div>
                <div className="text-[0.7rem] text-text-muted">{hwStatus.cashDrawer.connected ? hwStatus.cashDrawer.model : 'Disconnected'}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {hwStatus.cashDrawer.connected ? (
                <button className="btn btn-sm btn-outline" onClick={kickDrawer} disabled={!!testing}>
                  {testing === 'drawer' ? 'Kicking...' : 'Open Drawer'}
                </button>
              ) : (
                <button className="btn btn-sm btn-gold" onClick={async () => { await HAL.connectCashDrawer(); refreshStatus(); }} disabled={!!testing}>
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
