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
  <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: 12, minWidth: 200, flex: '1 1 200px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[status] }} />
        <span style={{ fontWeight: 700, fontSize: '.8rem' }}>{status}</span>
      </div>
      <span className="badge badge-gray">{jobs.length}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {jobs.map(job => (
        <div key={job.id} onClick={() => { onSelect(job); }}
          style={{
            background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
            padding: '10px 12px', cursor: 'pointer', transition: 'all .15s',
            border: `1px solid ${job.type === 'Rush' ? '#FECACA' : 'var(--surface-border)'}`,
            borderLeft: `3px solid ${STATUS_COLOR[status] || '#94A3B8'}`,
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <code style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{job.jobNo}</code>
            <span className={`badge ${TYPE_BADGE[job.type] || 'badge-gray'}`} style={{ fontSize: '.65rem' }}>{job.type}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '.82rem', marginBottom: 2 }}>{job.customerName}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{job.garment}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.72rem', color: isOverdue(job.dueDate, job.status) ? 'var(--status-error)' : 'var(--text-muted)', fontWeight: isOverdue(job.dueDate, job.status) ? 700 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
              <SvgIcon name={isOverdue(job.dueDate, job.status) ? 'warning' : 'calendar'} width="12" height="12" /> Due {fmtDate(job.dueDate)}
            </span>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--tux-navy)' }}>{fmt(job.price)}</span>
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <SvgIcon name="user" width="10" height="10" /> {job.assignedToName}
          </div>
        </div>
      ))}
      {jobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 8px', color: 'var(--text-muted)', fontSize: '.8rem' }}>Empty</div>
      )}
    </div>
  </div>
));
