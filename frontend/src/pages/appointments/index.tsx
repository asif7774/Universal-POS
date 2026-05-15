import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { Appointment } from './types';
import { TODAY, DAYS, HOURS, TYPE_CONFIG, STATUS_CONFIG, fmtDay } from './constants';
import { NewApptModal } from './components/NewApptModal';
import { AppointmentDetailModal } from './components/AppointmentDetailModal';

const Appointments: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [view, setView] = useState<'week' | 'list'>('week');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showNew, setShowNew] = useState(false);
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      return await apiClient.get<Appointment[]>('/appointments');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiClient.put(`/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSelected(null);
    }
  });

  if (isLoading) return <div className="page-header"><h1 className="page-title">Loading Appointments...</h1></div>;
  if (error) return <div className="page-header"><h1 className="page-title" style={{ color: 'red' }}>Error loading appointments</h1></div>;

  const dayAppts = appointments.filter(a => a.date === selectedDay).sort((a, b) => a.time.localeCompare(b.time));
  const todayCount = appointments.filter(a => a.date === TODAY && a.status !== 'Cancelled').length;
  const confirmedToday = appointments.filter(a => a.date === TODAY && a.status === 'Confirmed').length;

  const apptsByDay: Record<string, Appointment[]> = {};
  DAYS.forEach(d => { apptsByDay[d] = appointments.filter(a => a.date === d).sort((a, b) => a.time.localeCompare(b.time)); });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{todayCount} today · {confirmedToday} confirmed · {appointments.filter(a => a.status === 'No-Show').length} no-shows this week</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 8, padding: 3 }}>
            {(['week','list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '.78rem', background: view === v ? 'var(--surface-card)' : 'transparent', color: view === v ? 'var(--tux-navy)' : 'var(--text-muted)', transition: 'all .15s', boxShadow: view === v ? 'var(--shadow-sm)' : 'none' }}>
                {v === 'week' ? '📅 Week' : '☰ List'}
              </button>
            ))}
          </div>
          <button className="btn btn-gold" onClick={() => setShowNew(true)}>+ New Appointment</button>
        </div>
      </div>

      {/* Week strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {DAYS.map(d => {
          const info = fmtDay(d);
          const count = apptsByDay[d]?.filter(a => a.status !== 'Cancelled').length ?? 0;
          const isSelected = d === selectedDay;
          return (
            <button key={d} onClick={() => setSelectedDay(d)}
              style={{
                minWidth: 72, padding: '10px 8px', borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isSelected ? 'var(--tux-navy)' : info.isToday ? 'var(--tux-gold)' : 'var(--surface-border)'}`,
                background: isSelected ? 'var(--tux-navy)' : info.isToday ? '#FDF8E7' : 'var(--surface-card)',
                color: isSelected ? 'white' : info.isPast && !info.isToday ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                opacity: info.isPast && !info.isToday ? 0.6 : 1,
              }}>
              <div style={{ fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>
                {info.weekday}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>{info.day}</div>
              <div style={{ fontSize: '.68rem', marginTop: 2 }}>{info.month}</div>
              {count > 0 && (
                <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,.3)' : info.isToday ? 'var(--tux-gold)' : 'var(--surface-hover)', fontSize: '.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : 'var(--text-secondary)' }}>{count}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {view === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 0 }}>
          {/* Time grid */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {HOURS.map(h => (
              <div key={h} style={{ height: 60, display: 'flex', alignItems: 'flex-start', paddingTop: 6, justifyContent: 'flex-end', paddingRight: 12, fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</div>
            ))}
          </div>

          {/* Appointment slots */}
          <div style={{ position: 'relative', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
            {/* Hour dividers */}
            {HOURS.map((h, i) => (
              <div key={h} style={{ position: 'absolute', top: i * 60, left: 0, right: 0, height: 60, borderTop: i > 0 ? '1px solid var(--surface-border)' : 'none', borderTopStyle: i % 2 === 0 ? 'solid' : 'dashed' }} />
            ))}

            {/* Current time indicator (today only) */}
            {selectedDay === TODAY && (() => {
              const now = new Date();
              const startH = 9, endH = 18;
              const pct = ((now.getHours() - startH) * 60 + now.getMinutes()) / ((endH - startH) * 60);
              if (pct < 0 || pct > 1) return null;
              return (
                <div style={{ position: 'absolute', top: pct * HOURS.length * 60, left: 0, right: 0, height: 2, background: 'var(--status-error)', zIndex: 10 }}>
                  <div style={{ position: 'absolute', left: -5, top: -4, width: 10, height: 10, borderRadius: '50%', background: 'var(--status-error)' }} />
                </div>
              );
            })()}

            {/* Appointment blocks */}
            {dayAppts.map(appt => {
              const [h, m] = appt.time.split(':').map(Number);
              const startMin = (h - 9) * 60 + m;
              const cfg = TYPE_CONFIG[appt.type];
              const cancelled = appt.status === 'Cancelled';
              return (
                <div key={appt.id}
                  onClick={() => setSelected(appt)}
                  style={{
                    position: 'absolute',
                    top: (startMin / 30) * 30,
                    left: 8, right: 8,
                    height: Math.max((appt.duration / 30) * 30 - 4, 28),
                    background: cancelled ? 'var(--surface-hover)' : cfg.bg,
                    border: `1.5px solid ${cancelled ? 'var(--surface-border)' : cfg.color}22`,
                    borderLeft: `3px solid ${cancelled ? 'var(--text-muted)' : cfg.color}`,
                    borderRadius: 8,
                    padding: '5px 10px',
                    cursor: 'pointer',
                    opacity: cancelled ? 0.5 : 1,
                    zIndex: 5,
                    transition: 'all .15s',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: '.75rem' }}>{cfg.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '.78rem', color: cfg.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.customer}</span>
                    <span className={`badge ${STATUS_CONFIG[appt.status].cls}`} style={{ fontSize: '.6rem', marginLeft: 'auto', flexShrink: 0 }}>{appt.status}</span>
                  </div>
                  {appt.duration >= 30 && (
                    <div style={{ fontSize: '.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{appt.type} · {appt.time} · {appt.duration}min</div>
                  )}
                </div>
              );
            })}

            {dayAppts.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem' }}>📅</div>
                <div style={{ fontSize: '.9rem' }}>No appointments</div>
                <button className="btn btn-outline btn-sm" onClick={() => setShowNew(true)}>+ Add Appointment</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Time</th><th>Customer</th><th>Type</th><th>Duration</th><th>Assigned</th><th>Status</th><th>Notes</th><th></th></tr>
            </thead>
            <tbody>
              {appointments.slice().sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(appt => {
                const cfg = TYPE_CONFIG[appt.type] || TYPE_CONFIG['Consultation'];
                const scfg = STATUS_CONFIG[appt.status];
                const dInfo = fmtDay(appt.date);
                return (
                  <tr key={appt.id} onClick={() => setSelected(appt)} style={{ opacity: appt.status === 'Cancelled' ? 0.5 : 1 }}>
                    <td style={{ fontWeight: 600, fontSize: '.85rem', whiteSpace: 'nowrap' }}>
                      {appt.date === TODAY ? <span style={{ color: 'var(--tux-gold)', fontWeight: 700 }}>Today</span> : `${dInfo.weekday} ${dInfo.day} ${dInfo.month}`}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--tux-navy)', whiteSpace: 'nowrap' }}>{appt.time}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{appt.customer}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{appt.phone}</div>
                    </td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, background: cfg.bg, color: cfg.color, fontSize: '.78rem', fontWeight: 600 }}>{cfg.icon} {appt.type}</span></td>
                    <td style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{appt.duration}min</td>
                    <td style={{ fontSize: '.82rem' }}>{appt.assignedTo}</td>
                    <td><span className={`badge ${scfg.cls}`}>{appt.status}</span></td>
                    <td style={{ maxWidth: 180 }}><span style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{appt.notes ?? '—'}</span></td>
                    <td><button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); setSelected(appt); }}>View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      <AppointmentDetailModal 
        selected={selected} 
        setSelected={setSelected} 
        updateMutation={updateMutation} 
      />

      {showNew && <NewApptModal onClose={() => setShowNew(false)} defaultDate={selectedDay} />}
    </div>
  );
};

export default Appointments;
