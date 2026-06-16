import React, { useState } from 'react';

interface PinFormProps {
  loading: boolean;
  onLogin: (pin: string) => Promise<boolean>;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export const PinForm: React.FC<PinFormProps> = ({ loading, onLogin, onSuccess, onError }) => {
  const [pin, setPin] = useState('');
  const PIN_KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 6) {
        void (async () => {
          const ok = await onLogin(next);
          if (ok) { onSuccess(); }
          else { onError('Invalid PIN'); setPin(''); }
        })();
      }
    }
  };

  const handlePinDelete = () => { setPin(p => p.slice(0, -1)); };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[var(--text-secondary)] text-[.85rem] text-center">
        Enter your cashier PIN to quickly access the terminal
      </p>

      {/* PIN dots */}
      <div className="flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: '50%',
            background: i < pin.length ? 'var(--accent-gold)' : 'var(--border-subtle)',
            transition: 'background .15s',
            transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
          }} />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-60">
        {PIN_KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => {
              if (key === '⌫') {handlePinDelete();}
              else if (key !== '') {handlePinInput(key);}
            }}
            disabled={key === '' || loading}
            className="h-[60px] rounded-[var(--radius-md)] border-[1.5px] border-[var(--surface-border)] font-bold transition-all duration-100 shadow-sm"
            style={{
              background: key === '⌫' ? 'var(--status-error-subtle)' : 'var(--bg-panel)',
              color: key === '⌫' ? 'var(--status-error)' : 'var(--text-primary)',
              fontSize: key === '⌫' ? '1.1rem' : '1.3rem',
              cursor: key === '' ? 'default' : 'pointer',
              visibility: key === '' ? 'hidden' : 'visible',
            }}
            onMouseDown={e => {
              (e.currentTarget.style.transform = 'scale(.95)');
              (e.currentTarget.style.boxShadow = 'none');
            }}
            onMouseUp={e => {
              (e.currentTarget.style.transform = 'scale(1)');
              (e.currentTarget.style.boxShadow = 'var(--shadow-sm)');
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-[var(--text-muted)] text-[.85rem]">
          Verifying PIN...
        </div>
      )}
    </div>
  );
};
