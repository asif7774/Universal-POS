import React from 'react';

interface SizeCellProps {
  data: { total: number; available: number; out: number; cleaning: number };
  lowThreshold: number;
}

export const SizeCell: React.FC<SizeCellProps> = ({ data, lowThreshold }) => {
  const isLow = data.available <= lowThreshold;
  return (
    <div style={{
      padding: '6px 8px', borderRadius: 6,
      background: data.available === 0 ? '#FEF2F2' : isLow ? '#FFFBEB' : '#ECFDF5',
      border: `1px solid ${data.available === 0 ? '#FECACA' : isLow ? '#FDE68A' : '#A7F3D0'}`,
      textAlign: 'center', minWidth: 56,
    }}>
      <div style={{ fontWeight: 800, fontSize: '.9rem', color: data.available === 0 ? '#991B1B' : isLow ? '#92400E' : '#065F46' }}>
        {data.available}
      </div>
      <div style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>/ {data.total}</div>
      {data.out > 0 && <div style={{ fontSize: '.6rem', color: 'var(--tux-navy)', fontWeight: 600 }}>{data.out} out</div>}
      {data.cleaning > 0 && <div style={{ fontSize: '.6rem', color: '#7C3AED' }}>{data.cleaning} clean</div>}
    </div>
  );
};
