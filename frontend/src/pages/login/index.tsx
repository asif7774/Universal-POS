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
    <main className="login-page" id="main-content">
      <BrandPanel />

      <section className="login-form-panel">
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div style={{ display: 'none', marginBottom: 32, textAlign: 'center' }} className="mobile-logo">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--tux-navy)' }}>
              Tuxedo<span style={{ color: 'var(--tux-gold)' }}>POS</span>
            </h1>
          </div>

          <header style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
              Sign in to your TuxedoPOS account
            </p>
          </header>

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            marginBottom: 28,
          }}>
            {(['email', 'pin'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '.875rem',
                  transition: 'all .15s',
                  background: tab === t ? 'var(--surface-card)' : 'transparent',
                  color: tab === t ? 'var(--tux-navy)' : 'var(--text-muted)',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <SvgIcon name={t === 'email' ? 'mail' : 'lock'} width="16" height="16" />
                {t === 'email' ? 'Email Login' : 'PIN Login'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div role="alert" style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              color: 'var(--status-error)', fontSize: '.85rem',
              marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <SvgIcon name="warning" width="16" height="16" /> {error}
            </div>
          )}

          {tab === 'email' ? (
            <EmailForm loading={loading} onLogin={handleEmailLogin} onSuccess={onSuccess} onError={onError} />
          ) : (
            <PinForm loading={loading} onLogin={handlePinLogin} onSuccess={onSuccess} onError={onError} />
          )}

          {/* Demo credentials hint */}
          <div style={{
            marginTop: 32,
            padding: '12px 16px',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--surface-border)',
          }}>
            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
              DEMO CREDENTIALS
            </p>
            <p style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>
              Email: <code style={{ color: 'var(--tux-navy)', fontWeight: 600 }}>admin@tuxedopos.com</code>
              <br />
              Password: <code style={{ color: 'var(--tux-navy)', fontWeight: 600 }}>password</code>
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
};

export default Login;
