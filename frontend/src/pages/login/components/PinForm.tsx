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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem', textAlign: 'center' }}>
        Enter your cashier PIN to quickly access the terminal
      </p>

      {/* PIN dots */}
      <div style={{ display: 'flex', gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: '50%',
            background: i < pin.length ? 'var(--tux-navy)' : 'var(--surface-border)',
            transition: 'background .15s',
            transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
          }} />
        ))}
      </div>

      {/* Numpad */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, width: 240,
      }}>
        {PIN_KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => {
              if (key === '⌫') {handlePinDelete();}
              else if (key !== '') {handlePinInput(key);}
            }}
            disabled={key === '' || loading}
            style={{
              height: 60,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--surface-border)',
              background: key === '⌫' ? '#FEF2F2' : 'var(--surface-card)',
              color: key === '⌫' ? 'var(--status-error)' : 'var(--text-primary)',
              fontSize: key === '⌫' ? '1.1rem' : '1.3rem',
              fontWeight: 700,
              cursor: key === '' ? 'default' : 'pointer',
              transition: 'all .1s',
              boxShadow: 'var(--shadow-sm)',
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
        <div style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>
          Verifying PIN...
        </div>
      )}
    </div>
  );
};
