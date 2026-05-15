import React from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const BrandPanel: React.FC = () => (
  <aside className="login-brand" aria-hidden="true">
    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <SvgIcon name="bowtie" width="48" height="48" />
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
);
