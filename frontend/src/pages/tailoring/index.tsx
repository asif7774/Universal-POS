import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { TailoringJob, JobStatus } from 'types/tailoring';
import { STAGES, STATUS_COLOR, TYPE_BADGE, fmt, fmtDate, isOverdue } from 'constants/tailoring';
import { StatusPipeline } from './components/StatusPipeline';
import { KanbanCol } from './components/KanbanCol';
import { TailoringDetailModal } from './components/TailoringDetailModal';

const Tailoring: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selected, setSelected] = useState<TailoringJob | null>(null);
  const [search, setSearch] = useState('');
  
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['tailoring'],
    queryFn: () => apiClient.get<TailoringJob[]>('/tailoring'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => apiClient.put(`/tailoring/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tailoring'] });
      setSelected(null);
    }
  });

  const filtered = jobs.filter(j =>
    j.customerName.toLowerCase().includes(search.toLowerCase()) ||
    j.jobNo.toLowerCase().includes(search.toLowerCase()) ||
    j.garment.toLowerCase().includes(search.toLowerCase())
  );

  const activeStages: JobStatus[] = ['Pending', 'Cutting', 'Stitching', 'Finishing', 'Quality Check', 'Ready'];
  const totalRevenue = jobs.reduce((s, j) => s + Number(j.price), 0);
  const overdueCount = jobs.filter(j => isOverdue(j.dueDate, j.status)).length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tailoring Jobs</h1>
          <p className="page-subtitle">{jobs.length} active jobs · {overdueCount > 0 ? `⚠️ ${overdueCount} overdue · ` : ''}{fmt(totalRevenue)} pending revenue</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['kanban', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '.78rem', background: view === v ? 'var(--surface-card)' : 'transparent', color: view === v ? 'var(--tux-navy)' : 'var(--text-muted)', transition: 'all .15s', boxShadow: view === v ? 'var(--shadow-sm)' : 'none' }}>
                {v === 'kanban' ? '⬛ Kanban' : '☰ List'}
              </button>
            ))}
          </div>
          <button className="btn btn-gold">+ New Job Card</button>
        </div>
      </div>

      <div className="input-with-icon" style={{ marginBottom: 20, maxWidth: 400 }}>
        <span className="input-icon">
          <SvgIcon name="search" width="15" height="15" />
        </span>
        <input className="input" placeholder="Search by customer, job no, garment..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>
      
      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading jobs...</div>
      ) : (
        <>
          {/* Kanban View */}
          {view === 'kanban' && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
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
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                    <tr key={j.id} onClick={() => setSelected(j)}>
                      <td><code style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 700 }}>{j.jobNo}</code></td>
                      <td style={{ fontWeight: 600, fontSize: '.875rem' }}>{j.customerName}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>{j.garment}</td>
                      <td><span className={`badge ${TYPE_BADGE[j.type] || 'badge-gray'}`}>{j.type}</span></td>
                      <td style={{ fontSize: '.85rem' }}>{j.assignedToName}</td>
                      <td style={{ fontSize: '.82rem', color: isOverdue(j.dueDate, j.status) ? 'var(--status-error)' : 'var(--text-primary)', fontWeight: isOverdue(j.dueDate, j.status) ? 700 : 400 }}>
                        {isOverdue(j.dueDate, j.status) ? '⚠️ ' : ''}{fmtDate(j.dueDate)}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--tux-navy)' }}>{fmt(j.price)}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, background: `${STATUS_COLOR[j.status] || '#94A3B8'}18`, color: STATUS_COLOR[j.status] || '#94A3B8', fontSize: '.75rem', fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[j.status] || '#94A3B8' }} />
                          {j.status}
                        </span>
                      </td>
                      <td style={{ minWidth: 120 }}><StatusPipeline current={j.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No jobs found</div>
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
    </div>
  );
};

export default Tailoring;
