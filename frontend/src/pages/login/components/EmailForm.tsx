import React, { useState } from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface EmailFormProps {
  loading: boolean;
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export const EmailForm: React.FC<EmailFormProps> = ({ loading, onLogin, onSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { onError('Please fill in all fields'); return; }
    const ok = await onLogin(email, password);
    if (ok) { onSuccess(); }
    else { onError('Invalid email or password. Please check your credentials.'); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <div className="input-group">
        <label className="input-label" htmlFor="email">Email address</label>
        <div className="input-with-icon">
          <span className="input-icon">
            <SvgIcon name="mail" width="16" height="16" />
          </span>
          <input
            id="email" type="email" className="input"
            placeholder="you@example.com"
            value={email} onChange={e => { setEmail(e.target.value); }}
            autoComplete="email" required
          />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="password">Password</label>
        <div className="input-with-icon relative">
          <span className="input-icon">
            <SvgIcon name="lock" width="16" height="16" />
          </span>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="input pr-[44px]"
            placeholder="••••••••"
            value={password} onChange={e => { setPassword(e.target.value); }}
            autoComplete="current-password" required
          />
          <button
            type="button"
            onClick={() => { setShowPassword(s => !s); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-[2px]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <SvgIcon name={showPassword ? 'eye-slash' : 'eye'} width="18" height="18" />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <a href="#" className="text-xs text-[var(--accent-gold-text)] font-medium hover:underline">
          Forgot password?
        </a>
      </div>

      <button
        type="submit" disabled={loading}
        className="btn btn-gold w-full mt-1"
      >
        {loading ? (
          <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : 'Sign in'}
      </button>
    </form>
  );
};
