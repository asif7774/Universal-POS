import { memo } from 'react';
import { JobStatus, TailoringJob } from 'types/tailoring';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { STATUS_COLOR, TYPE_BADGE, isOverdue, fmtDate, fmt } from 'constants/tailoring';

interface KanbanColProps {
  status: JobStatus;
  jobs: TailoringJob[];
  onSelect: (j: TailoringJob) => void;
}

export const KanbanCol = memo(({ status, jobs, onSelect }: KanbanColProps) => (
  <div className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-xl)] p-3 min-w-[200px] flex-[1_1_200px]">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <div className="w-[10px] h-[10px] rounded-full" style={{ background: STATUS_COLOR[status] }} />
        <span className="panel-title text-sm">{status}</span>
      </div>
      <span className="badge badge-neutral">{jobs.length}</span>
    </div>
    <div className="flex flex-col gap-2">
      {jobs.map(job => (
        <div key={job.id} onClick={() => { onSelect(job); }}
          className="panel p-3 mb-0 cursor-grab active:cursor-grabbing hover:bg-[var(--bg-panel-hover)] transition-all"
          style={{
            borderLeft: `3px solid ${STATUS_COLOR[status] || '#94A3B8'}`,
            border: `1px solid ${job.type === 'Rush' ? '#FECACA' : 'var(--border-subtle)'}`,
            borderLeftWidth: 3,
            borderLeftColor: STATUS_COLOR[status] || '#94A3B8',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          <div className="flex justify-between mb-1">
            <code className="text-[0.72rem] text-[var(--text-muted)] font-bold">{job.jobNo}</code>
            <span className={`badge ${TYPE_BADGE[job.type] || 'badge-neutral'} text-[.65rem]`}>{job.type}</span>
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{job.customerName}</div>
          <div className="text-xs text-[var(--text-muted)] mb-1.5">{job.garment}</div>
          <div className="flex justify-between items-center">
            <span className={`flex items-center gap-1 ${isOverdue(job.dueDate, job.status) ? 'text-xs text-[var(--status-error)] font-semibold' : 'text-xs text-[var(--text-muted)]'}`}>
              <SvgIcon name={isOverdue(job.dueDate, job.status) ? 'warning' : 'calendar'} width="12" height="12" /> Due {fmtDate(job.dueDate)}
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{fmt(job.price)}</span>
          </div>
          <div className="text-[0.72rem] text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <SvgIcon name="user" width="10" height="10" /> {job.assignedToName}
          </div>
        </div>
      ))}
      {jobs.length === 0 && (
        <div className="text-center py-5 text-[var(--text-muted)] text-xs">Empty</div>
      )}
    </div>
  </div>
));
