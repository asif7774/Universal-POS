import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

type JobStatus = 'Pending' | 'Cutting' | 'Stitching' | 'Finishing' | 'Quality Check' | 'Ready' | 'Delivered';

interface TailoringJob {
  id: string;
  jobNo: string;
  customerName: string;
  phone: string;
  garment: string;
  type: 'Alteration' | 'New Stitch' | 'Repair' | 'Rush';
  assignedToName: string;
  status: JobStatus;
  dueDate: string;
  price: number;
  description: string;
  notes?: string;
}

const STAGES: JobStatus[] = ['Pending', 'Cutting', 'Stitching', 'Finishing', 'Quality Check', 'Ready', 'Delivered'];

const STATUS_COLOR: Record<JobStatus, string> = {
  Pending: '#94A3B8', Cutting: '#3B82F6', Stitching: '#8B5CF6',
  Finishing: '#F59E0B', 'Quality Check': '#F97316', Ready: '#10B981', Delivered: '#6B7280',
};

const TYPE_BADGE: Record<string, string> = {
  Alteration: 'badge-navy', 'New Stitch': 'badge-gold', Repair: 'badge-gray', Rush: 'badge-red',
};

const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;
const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
const isOverdue = (d: string | null | undefined, status: JobStatus) =>
  d && new Date(d) < new Date() && !['Delivered', 'Ready'].includes(status);

const StatusPipeline: React.FC<{ current: JobStatus }> = ({ current }) => {
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
};

// Kanban column
const KanbanCol: React.FC<{ status: JobStatus; jobs: TailoringJob[]; onSelect: (j: TailoringJob) => void }> = ({ status, jobs, onSelect }) => (
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
        <div key={job.id} onClick={() => onSelect(job)}
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
            <span style={{ fontSize: '.72rem', color: isOverdue(job.dueDate, job.status) ? 'var(--status-error)' : 'var(--text-muted)', fontWeight: isOverdue(job.dueDate, job.status) ? 700 : 400 }}>
              {isOverdue(job.dueDate, job.status) ? '⚠️ ' : '📅 '}Due {fmtDate(job.dueDate)}
            </span>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--tux-navy)' }}>{fmt(job.price)}</span>
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 4 }}>👤 {job.assignedToName}</div>
        </div>
      ))}
      {jobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 8px', color: 'var(--text-muted)', fontSize: '.8rem' }}>Empty</div>
      )}
    </div>
  </div>
);

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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
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
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.jobNo}</h3>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span className={`badge ${TYPE_BADGE[selected.type] || 'badge-gray'}`}>{selected.type}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: `${STATUS_COLOR[selected.status] || '#94A3B8'}18`, color: STATUS_COLOR[selected.status] || '#94A3B8', fontSize: '.75rem', fontWeight: 600 }}>
                    {selected.status}
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Progress pipeline */}
              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>PROGRESS</div>
                <StatusPipeline current={selected.status} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {STAGES.filter(s => s !== 'Delivered').map(s => (
                    <span key={s} style={{ fontSize: '.6rem', color: 'var(--text-muted)', textAlign: 'center', flex: 1 }}>{s === selected.status ? <strong>{s}</strong> : s}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Customer', value: selected.customerName },
                  { label: 'Phone', value: selected.phone || 'N/A' },
                  { label: 'Garment', value: selected.garment },
                  { label: 'Assigned Tailor', value: selected.assignedToName },
                  { label: 'Due Date', value: fmtDate(selected.dueDate) },
                  { label: 'Price', value: fmt(selected.price) },
                ].map(i => (
                  <div key={i.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>{i.label}</div>
                    <div style={{ fontSize: '.875rem', fontWeight: 700 }}>{i.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>WORK DESCRIPTION</div>
                <p style={{ fontSize: '.875rem', margin: 0 }}>{selected.description || 'No description provided.'}</p>
              </div>

              {selected.notes && (
                <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E' }}>
                  ⚠️ {selected.notes}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline">Edit Job</button>
              {selected.status !== 'Delivered' && selected.status !== 'Ready' && (
                <button className="btn btn-primary" disabled={updateStatus.isPending} onClick={() => {
                  const currentIdx = STAGES.indexOf(selected.status);
                  if (currentIdx < STAGES.length - 1) {
                    updateStatus.mutate({ id: selected.id, status: STAGES[currentIdx + 1] });
                  }
                }}>
                  {updateStatus.isPending ? 'Advancing...' : '→ Advance Stage'}
                </button>
              )}
              {selected.status === 'Ready' && (
                <button className="btn btn-gold" disabled={updateStatus.isPending} onClick={() => {
                  updateStatus.mutate({ id: selected.id, status: 'Delivered' });
                }}>
                  {updateStatus.isPending ? 'Marking...' : '✓ Mark Delivered'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tailoring;
