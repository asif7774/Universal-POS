import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { TailoringJob, JobStatus } from 'types/tailoring';
import { STATUS_COLOR, TYPE_BADGE, fmt, fmtDate, isOverdue } from 'constants/tailoring';
import { StatusPipeline } from './components/StatusPipeline';
import { KanbanCol } from './components/KanbanCol';
import { TailoringDetailModal } from './components/TailoringDetailModal';
import { NewTailoringJobModal } from './components/NewTailoringJobModal';
import { usePageHeader } from 'contexts/PageHeaderContext';

const Tailoring: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selected, setSelected] = useState<TailoringJob | null>(null);
  const [search, setSearch] = useState('');
  const [showNewJob, setShowNewJob] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['tailoring'],
    queryFn: () => apiClient.get<TailoringJob[]>('/tailoring'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => apiClient.put(`/tailoring/${id}/status`, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tailoring'] });
      setSelected(null);
    }
  });

  const filtered = jobs.filter(j =>
    j.customerName.toLowerCase().includes(search.toLowerCase()) ||
    j.jobNo.toLowerCase().includes(search.toLowerCase()) ||
    j.garment.toLowerCase().includes(search.toLowerCase())
  );

  const activeStages: JobStatus[] = ['Pending', 'Cutting', 'Stitching', 'Finishing', 'Quality Check', 'Ready'];
  const totalRevenue = jobs.reduce((s, j) => s + j.price, 0);
  const overdueCount = jobs.filter(j => isOverdue(j.dueDate, j.status)).length;

  usePageHeader({
    title: 'Tailoring Jobs',
    subtitle: `${jobs.length} active jobs · ${overdueCount > 0 ? `${overdueCount} overdue · ` : ''}${fmt(totalRevenue)} revenue`,
    actions: (
      <div className="flex gap-3 items-center">
        {/* View toggle */}
        <div className="flex bg-[var(--surface-hover)] rounded-[10px] p-[3px]">
          {(['kanban', 'list'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); }}
              className={`btn btn-sm px-3 py-1.5 text-[0.75rem] rounded-lg ${view === v ? 'btn-primary' : 'btn-ghost'}`}>
              <SvgIcon name={v === 'kanban' ? 'chart-bar' : 'clipboard'} width="14" height="14" />
              {v === 'kanban' ? 'Kanban' : 'List'}
            </button>
          ))}
        </div>
        <button className="btn btn-gold" onClick={() => { setShowNewJob(true); }}>+ New Job Card</button>
      </div>
    ),
  });

  return (
    <div className="animate-fade-in">
      <div className="search-container">
        <div className="search-input-wrapper input-with-icon">
          <span className="input-icon">
            <SvgIcon name="search" width="18" height="18" />
          </span>
          <input className="input" placeholder="Search by customer, job no, garment..." value={search}
            onChange={e => { setSearch(e.target.value); }} />
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-10 text-center text-[var(--text-muted)]">Loading jobs...</div>
      ) : (
        <>
          {/* Kanban View */}
          {view === 'kanban' && (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {activeStages.map(status => (
                <KanbanCol key={status} status={status}
                  jobs={filtered.filter(j => j.status === status)}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <div className="card p-0 overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job #</th>
                    <th>Customer</th>
                    <th>Garment</th>
                    <th>Type</th>
                    <th>Assigned To</th>
                    <th>Due</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(j => (
                    <tr key={j.id} onClick={() => { setSelected(j); }}>
                      <td><code className="text-[0.8rem] text-[var(--tux-navy)] font-bold">{j.jobNo}</code></td>
                      <td className="font-semibold text-[0.875rem]">{j.customerName}</td>
                      <td className="text-[var(--text-secondary)] text-[0.85rem]">{j.garment}</td>
                      <td><span className={`badge ${TYPE_BADGE[j.type] || 'badge-gray'}`}>{j.type}</span></td>
                      <td className="text-[0.85rem]">{j.assignedToName}</td>
                      <td className={`text-[0.82rem] flex items-center gap-1.5 ${isOverdue(j.dueDate, j.status) ? 'text-[var(--status-error)] font-bold' : 'text-[var(--text-primary)]'}`}>
                        {isOverdue(j.dueDate, j.status) && <SvgIcon name="warning" width="12" height="12" />}
                        {fmtDate(j.dueDate)}
                      </td>
                      <td className="font-bold text-[var(--tux-navy)]">{fmt(j.price)}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.75rem] font-semibold" style={{ background: `${STATUS_COLOR[j.status] || '#94A3B8'}18`, color: STATUS_COLOR[j.status] || '#94A3B8' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[j.status] || '#94A3B8' }} />
                          {j.status}
                        </span>
                      </td>
                      <td style={{ minWidth: 120 }}><StatusPipeline current={j.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center p-10 text-[var(--text-muted)]">No jobs found</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <TailoringDetailModal 
        selected={selected} 
        setSelected={setSelected} 
        updateStatus={updateStatus} 
      />

      {showNewJob && <NewTailoringJobModal onClose={() => { setShowNewJob(false); }} />}
    </div>
  );
};

export default Tailoring;
