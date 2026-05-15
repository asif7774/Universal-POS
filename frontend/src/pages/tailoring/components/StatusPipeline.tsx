import React, { memo } from 'react';
import { JobStatus } from '../types';
import { STAGES, STATUS_COLOR } from '../constants';

interface StatusPipelineProps {
  current: JobStatus;
}

export const StatusPipeline = memo(({ current }: StatusPipelineProps) => {
  const idx = STAGES.indexOf(current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}>
      {STAGES.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            background: i <= idx ? STATUS_COLOR[current] : 'var(--surface-border)',
            border: i === idx ? `2px solid ${STATUS_COLOR[current]}` : '2px solid transparent',
            boxShadow: i === idx ? `0 0 0 3px ${STATUS_COLOR[current]}22` : 'none',
            transition: 'all .2s',
          }} />
          {i < STAGES.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < idx ? STATUS_COLOR[current] : 'var(--surface-border)', transition: 'background .2s', minWidth: 8 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
});
