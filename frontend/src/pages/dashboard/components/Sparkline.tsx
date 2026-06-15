import React from 'react';

const VARIANT_COLOR: Record<string, string> = {
  gold:    'var(--accent-gold)',
  emerald: 'var(--accent-emerald)',
  error:   'var(--status-error)',
  primary: 'var(--text-secondary)',
};

export const Sparkline: React.FC<{ data: number[]; color?: string; colorVariant?: string }> = ({ data, color, colorVariant }) => {
  const resolvedColor = colorVariant ? (VARIANT_COLOR[colorVariant] ?? VARIANT_COLOR.primary) : (color ?? VARIANT_COLOR.primary);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={resolvedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={resolvedColor} fillOpacity=".12" stroke="none"
      />
    </svg>
  );
};
