import React, { memo } from 'react';
import { JobStatus } from 'types/tailoring';
import { STAGES, STATUS_COLOR } from 'constants/tailoring';

interface StatusPipelineProps {
  current: JobStatus;
}

export const StatusPipeline = memo(({ current }: StatusPipelineProps) => {
  const idx = STAGES.indexOf(current);
  return (
    <div className="flex items-center gap-0 overflow-hidden">
      {STAGES.map((s, i) => (
        <React.Fragment key={s}>
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200"
            style={{
              background: i < idx
                ? 'var(--accent-emerald-subtle)'
                : i === idx
                  ? 'var(--accent-gold)'
                  : 'var(--bg-panel-hover)',
              border: i === idx
                ? `2px solid var(--accent-gold)`
                : i < idx
                  ? '2px solid transparent'
                  : '2px solid var(--border-subtle)',
              boxShadow: i === idx ? `0 0 0 3px ${STATUS_COLOR[current]}22` : 'none',
            }}
          />
          {i < STAGES.length - 1 && (
            <div
              className="flex-1 h-0.5 min-w-2 transition-[background] duration-200"
              style={{
                background: i < idx ? 'var(--accent-emerald-subtle)' : 'var(--border-subtle)',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
});
