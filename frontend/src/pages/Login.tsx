import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';


const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'email' | 'pin'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    const ok = await login(email, password);
    if (ok) { navigate('/dashboard'); }
    else { setError('Invalid email or password. Try admin@tuxedopos.com / password'); }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 6) {
        // Auto-submit when 6 digits entered
        void (async () => {
          setError('');
          const ok = await login('', next, true);  // isPin = true
          if (ok) { navigate('/dashboard'); }
          else { setError('Invalid PIN'); setPin(''); }
        })();
      }
    }
  };

  const handlePinDelete = () => setPin(p => p.slice(0, -1));

  const PIN_KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <main className="login-page" id="main-content">
      {/* Left brand panel */}
      <aside className="login-brand" aria-hidden="true">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <SvgIcon name="bowtie" viewBox="0 0 48 48" width="48" height="48" />
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Tuxedo<span style={{ color: '#D4AF37' }}>POS</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.95rem', maxWidth: 280, lineHeight: 1.6 }}>
            The complete point-of-sale platform for formal wear rental & tailoring businesses.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '🎩', text: 'Rental booking & tracking' },
              { icon: '📐', text: 'Customer measurement profiles' },
              { icon: '🧵', text: 'Tailoring workflow management' },
              { icon: '📊', text: 'Real-time sales analytics' },
            ].map(f => (
              <div key={f.text} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,.06)',
                borderRadius: 10, padding: '10px 14px',
                border: '1px solid rgba(255,255,255,.08)',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                <span style={{ color: 'rgba(255,255,255,.8)', fontSize: '.875rem' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right form panel */}
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
                onClick={() => { setTab(t); setError(''); setPin(''); }}
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
                }}
              >
                {t === 'email' ? '📧 Email Login' : '🔢 PIN Login'}
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
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Email Form */}
          {tab === 'email' && (
            <form onSubmit={(e) => { void handleEmailLogin(e); }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email address</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <SvgIcon name="mail" width="16" height="16" />
                  </span>
                  <input
                    id="email" type="email" className="input"
                    placeholder="admin@tuxedopos.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    autoComplete="email" required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password">Password</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <span className="input-icon">
                    <SvgIcon name="lock" width="16" height="16" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password" required
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 2,
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <SvgIcon name={showPassword ? 'eye-slash' : 'eye'} width="18" height="18" />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a href="#" style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit" disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 4 }}
              >
                {loading ? (
                  <div style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                ) : 'Sign in'}
              </button>
            </form>
          )}

          {/* PIN Form */}
          {tab === 'pin' && (
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
                      if (key === '⌫') handlePinDelete();
                      else if (key !== '') handlePinInput(key);
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
