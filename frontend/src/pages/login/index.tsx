import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { BrandPanel } from './components/BrandPanel';
import { EmailForm } from './components/EmailForm';
import { PinForm } from './components/PinForm';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'email' | 'pin'>('email');
  const [error, setError] = useState('');

  const handleEmailLogin = async (email: string, pass: string) => {
    setError('');
    return await login(email, pass);
  };

  const handlePinLogin = async (pin: string) => {
    setError('');
    return await login('', pin, true);
  };

  const onSuccess = () => { navigate('/dashboard'); };
  const onError = (msg: string) => { setError(msg); };

  return (
    <div className="min-h-screen flex bg-[var(--bg-canvas)]" id="main-content">
      <BrandPanel />

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Tuxedo<span className="text-[var(--accent-gold)]">POS</span>
            </h1>
          </div>

          <header className="mb-8">
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">
              Sign in to your TuxedoPOS account
            </p>
          </header>

          {/* Tab switcher */}
          <div className="flex bg-[var(--bg-panel)] rounded-[var(--radius-md)] p-1 mb-7 border border-[var(--border-subtle)]">
            {(['email', 'pin'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={[
                  'flex flex-1 items-center justify-center gap-2 py-2 rounded-[7px] border-none cursor-pointer font-semibold text-sm transition-all duration-150',
                  tab === t
                    ? 'bg-[var(--bg-canvas)] text-[var(--text-primary)] shadow-sm'
                    : 'bg-transparent text-[var(--text-muted)]',
                ].join(' ')}
              >
                <SvgIcon name={t === 'email' ? 'mail' : 'lock'} width="16" height="16" />
                {t === 'email' ? 'Email Login' : 'PIN Login'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="flex items-center gap-2 bg-[var(--status-error-subtle)] border border-[var(--status-error)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-[var(--status-error)] text-sm mb-5">
              <SvgIcon name="warning" width="16" height="16" /> {error}
            </div>
          )}

          {tab === 'email' ? (
            <EmailForm loading={loading} onLogin={handleEmailLogin} onSuccess={onSuccess} onError={onError} />
          ) : (
            <PinForm loading={loading} onLogin={handlePinLogin} onSuccess={onSuccess} onError={onError} />
          )}

          {/* Demo credentials hint */}
          <div className="mt-8 px-4 py-3 bg-[var(--bg-panel)] rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wide">
              Demo Credentials
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Email: <code className="text-[var(--accent-gold-text)] font-semibold">james@tuxedopos.com</code>
              <br />
              Password: <code className="text-[var(--accent-gold-text)] font-semibold">pass</code>
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
