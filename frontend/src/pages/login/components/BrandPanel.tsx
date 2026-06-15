import React from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const BrandPanel: React.FC = () => (
  <aside
    className="hidden lg:flex w-[420px] bg-[#06111f] flex-col items-center justify-center p-12 relative overflow-hidden shrink-0"
    aria-hidden="true"
  >
    {/* Decorative background circles */}
    <div className="absolute -top-24 -right-24 w-[350px] h-[350px] rounded-full bg-[rgba(201,168,76,0.07)] pointer-events-none" />
    <div className="absolute -bottom-20 -left-20 w-[280px] h-[280px] rounded-full bg-[rgba(201,168,76,0.05)] pointer-events-none" />

    <div className="relative z-[1] text-center">
      {/* Logo icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)] to-[#a8873a] flex items-center justify-center mb-6 shadow-lg mx-auto">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 11L4 7v10l8 4 8-4V7l-8 4z" fill="white" />
          <ellipse cx="12" cy="7" rx="8" ry="3" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>

      <h1 className="text-3xl font-black text-white tracking-tight mb-3">
        Tuxedo<span className="text-[var(--accent-gold)]">POS</span>
      </h1>
      <p className="text-sm text-white/50 text-center max-w-[260px] mx-auto leading-relaxed">
        Premium rental management for formal wear boutiques
      </p>

      <div className="mt-12 flex flex-col gap-4">
        {[
          { icon: 'tuxedo',       text: 'Rental booking & tracking' },
          { icon: 'measurements', text: 'Customer measurement profiles' },
          { icon: 'tailoring',    text: 'Tailoring workflow management' },
          { icon: 'reports',      text: 'Real-time sales analytics' },
        ].map(f => (
          <div
            key={f.text}
            className="flex items-center gap-3 bg-white/5 rounded-[10px] px-3.5 py-2.5 border border-white/10"
          >
            <span className="text-white/60 flex">
              <SvgIcon name={f.icon} width="20" height="20" />
            </span>
            <span className="text-white/80 text-sm">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  </aside>
);
