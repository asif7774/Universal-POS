import React from 'react';

interface SizeCellProps {
  data: { total: number; available: number; out: number; cleaning: number };
  lowThreshold: number;
}

export const SizeCell: React.FC<SizeCellProps> = ({ data, lowThreshold }) => {
  const isLow = data.available > 0 && data.available <= lowThreshold;
  const badgeClass = data.available === 0 ? 'badge-error' : isLow ? 'badge-warning' : 'badge-emerald';

  return (
    <div className={`badge ${badgeClass}`} style={{ textAlign: 'center', minWidth: 56, padding: '6px 8px', borderRadius: 6, display: 'block' }}>
      <div style={{ fontWeight: 800, fontSize: '.9rem' }}>
        {data.available}
      </div>
      <div style={{ fontSize: '.62rem', opacity: 0.75 }}>/ {data.total}</div>
      {data.out > 0 && <div style={{ fontSize: '.6rem', fontWeight: 600, opacity: 0.8 }}>{data.out} out</div>}
      {data.cleaning > 0 && <div style={{ fontSize: '.6rem', opacity: 0.75 }}>{data.cleaning} clean</div>}
    </div>
  );
};
