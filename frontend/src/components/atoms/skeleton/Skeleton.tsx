import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
  count?: number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  circle = false, 
  className = '', 
  count = 1,
  style = {}
}) => {
  const elements = Array.from({ length: count });

  return (
    <>
      {elements.map((_, i) => (
        <div 
          key={i}
          className={`skeleton ${className}`}
          style={{
            width,
            height,
            borderRadius: circle ? '50%' : undefined,
            ...style
          }}
        />
      ))}
    </>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{ display: 'flex', gap: 16 }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} height={40} style={{ flex: 1 }} />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="card" style={{ padding: 20 }}>
    <Skeleton width="40%" height={16} style={{ marginBottom: 16 }} />
    <Skeleton height={32} style={{ marginBottom: 12 }} />
    <Skeleton width="60%" height={14} />
  </div>
);
