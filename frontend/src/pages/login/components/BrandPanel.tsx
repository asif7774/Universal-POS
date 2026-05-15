import React from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const BrandPanel: React.FC = () => (
  <aside className="login-brand" aria-hidden="true">
    <div className="relative z-[1] text-center">
      <div className="mb-6">
        <SvgIcon name="bowtie" width="48" height="48" />
      </div>
      <h1 className="font-['Playfair_Display'] text-[2.5rem] font-bold text-white leading-[1.1] mb-3">
        Tuxedo<span className="text-[var(--tux-gold)]">POS</span>
      </h1>
      <p className="text-white/60 text-[0.95rem] max-w-[280px] mx-auto leading-relaxed">
        The complete point-of-sale platform for formal wear rental & tailoring businesses.
      </p>

      <div className="mt-12 flex flex-col gap-4">
        {[
          { icon: 'tuxedo', text: 'Rental booking & tracking' },
          { icon: 'measurements', text: 'Customer measurement profiles' },
          { icon: 'tailoring', text: 'Tailoring workflow management' },
          { icon: 'reports', text: 'Real-time sales analytics' },
        ].map(f => (
          <div key={f.text} className="flex items-center gap-3 bg-white/5 rounded-[10px] p-[10px_14px] border border-white/10">
            <span className="text-white/60 flex">
              <SvgIcon name={f.icon} width="20" height="20" />
            </span>
            <span className="text-white/80 text-[0.875rem]">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  </aside>
);
