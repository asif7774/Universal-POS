import React from 'react';

interface SizeCellProps {
  data: { total: number; available: number; out: number; cleaning: number };
  lowThreshold: number;
}

export const SizeCell: React.FC<SizeCellProps> = ({ data, lowThreshold }) => {
  const isLow = data.available > 0 && data.available <= lowThreshold;
  const badgeClass = data.available === 0 ? 'badge-error' : isLow ? 'badge-warning' : 'badge-emerald';

  return (
    <div className={`badge ${badgeClass} text-center min-w-[56px] px-2 py-1.5 rounded-md block`}>
      <div className="font-extrabold text-[0.9rem] leading-none mb-1">
        {data.available}
      </div>
      <div className="text-[0.62rem] opacity-75 font-medium leading-none">/ {data.total}</div>
      {data.out > 0 && <div className="text-[0.6rem] font-semibold opacity-80 mt-1">{data.out} out</div>}
      {data.cleaning > 0 && <div className="text-[0.6rem] opacity-75 mt-0.5">{data.cleaning} clean</div>}
    </div>
  );
};
