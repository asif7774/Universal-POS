import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { Appointment } from 'types/appointments';
import { HOURS, TYPE_CONFIG, STATUS_CONFIG, fmtDay } from 'constants/appointments';
import { NewApptModal } from './components/NewApptModal';
import { AppointmentDetailModal } from './components/AppointmentDetailModal';
import { usePageHeader } from 'contexts/PageHeaderContext';

const Appointments: React.FC = () => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [weekOffset, setWeekOffset] = useState(0);
  const DAYS = useMemo(() => {
    const days: string[] = [];
    for (let i = weekOffset - 1; i < weekOffset + 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, [today, weekOffset]);
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().split('T')[0]);
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

  const todayCount = appointments.filter(a => a.date === today && a.status !== 'Cancelled').length;
  const confirmedToday = appointments.filter(a => a.date === today && a.status === 'Confirmed').length;

  usePageHeader({
    title: 'Appointments',
    subtitle: isLoading ? 'Loading...' : error ? 'Error loading appointments' : `${todayCount} today · ${confirmedToday} confirmed · ${appointments.filter(a => a.status === 'No-Show').length} no-shows this week`,
    actions: (
      <div className="flex gap-2.5">
        <div className="flex bg-[var(--bg-panel-hover)] rounded-lg p-[3px]">
          {(['week', 'list'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.25 rounded-md border-none cursor-pointer font-semibold text-[0.78rem] transition-all duration-150 ${view === v ? 'bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'bg-transparent text-[var(--text-muted)]'}`}>
              <SvgIcon name={v === 'week' ? 'appointments' : 'menu'} width="14" height="14" />
              {v === 'week' ? 'Week' : 'List'}
            </button>
          ))}
        </div>
        <button className="btn btn-gold" onClick={() => { setShowNew(true); }}>+ New Appointment</button>
      </div>
    ),
  });

  if (isLoading) { return <div className="p-10 text-center text-[var(--text-muted)]">Loading Appointments...</div>; }
  if (error) { return <div className="p-10 text-center text-red-500">Error loading appointments</div>; }

  const dayAppts = appointments.filter(a => a.date === selectedDay).sort((a, b) => a.time.localeCompare(b.time));

  const apptsByDay: Record<string, Appointment[]> = {};
  DAYS.forEach(d => { apptsByDay[d] = appointments.filter(a => a.date === d).sort((a, b) => a.time.localeCompare(b.time)); });

  return (
    <div className="animate-fade-in bg-[var(--bg-canvas)] p-6">
      {/* Week strip */}
      <div className="flex items-center gap-2 mb-6 pb-1 pt-4">
        <button
          className="btn btn-outline btn-sm shrink-0"
          onClick={() => {
            const newOffset = weekOffset - 7;
            setWeekOffset(newOffset);
            const d = new Date(today);
            d.setDate(d.getDate() + newOffset - 1);
            setSelectedDay(d.toISOString().split('T')[0]);
          }}
          title="Previous week"
        >
          <SvgIcon name="chevron-left" width="14" height="14" />
        </button>
        <div className="flex gap-2 overflow-x-auto flex-1">
        {DAYS.map(d => {
          const info = fmtDay(d);
          const count = apptsByDay[d]?.filter(a => a.status !== 'Cancelled').length ?? 0;
          const isSelected = d === selectedDay;
          return (
            <button key={d} onClick={() => { setSelectedDay(d); }}
              className={`min-w-[72px] p-2.5 px-2 rounded-[var(--radius-lg)] border-2 text-center transition-all duration-150 cursor-pointer ${isSelected ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[var(--accent-gold-text)]' : info.isToday ? 'border-[var(--accent-gold)] bg-[var(--bg-panel-hover)] text-[var(--text-primary)]' : 'border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)]'} ${info.isPast && !info.isToday ? 'opacity-60 text-[var(--text-muted)]' : 'opacity-100'}`}>
              <div className="text-[0.7rem] font-bold uppercase tracking-tight mb-0.5">
                {info.weekday}
              </div>
              <div className="text-[1.2rem] font-black leading-none">{info.day}</div>
              <div className="text-[0.68rem] mt-0.5">{info.month}</div>
              {count > 0 && (
                <div className="mt-1 flex justify-center">
                  <div className={`w-[18px] h-[18px] rounded-full text-[0.65rem] font-bold flex items-center justify-center ${isSelected ? 'bg-white/30 text-white' : info.isToday ? 'bg-[var(--accent-gold)] text-[var(--accent-gold-text)]' : 'bg-[var(--bg-panel-hover)] text-[var(--text-secondary)]'}`}>{count}</div>
                </div>
              )}
            </button>
          );
        })}
        </div>
        <button
          className="btn btn-outline btn-sm shrink-0"
          onClick={() => {
            const newOffset = weekOffset + 7;
            setWeekOffset(newOffset);
            const d = new Date(today);
            d.setDate(d.getDate() + newOffset - 1);
            setSelectedDay(d.toISOString().split('T')[0]);
          }}
          title="Next week"
        >
          <SvgIcon name="chevron-right" width="14" height="14" />
        </button>
      </div>

      {view === 'week' && (
        <div className="grid grid-cols-[80px_1fr] gap-0">
          {/* Time grid */}
          <div className="flex flex-col">
            {HOURS.map(h => (
              <div key={h} className="h-[60px] flex items-start pt-1.5 justify-end pr-3 text-[0.72rem] text-[var(--text-muted)] font-medium">{h}</div>
            ))}
          </div>

          {/* Appointment slots */}
          <div className="relative bg-[var(--bg-panel)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden">
            {/* Hour dividers */}
            {HOURS.map((h, i) => (
              <div key={h} className={`absolute left-0 right-0 h-[60px] ${i > 0 ? 'border-t border-[var(--border-subtle)]' : 'border-none'} ${i % 2 === 0 ? 'border-solid' : 'border-dashed'}`} style={{ top: i * 60 }} />
            ))}

            {/* Current time indicator (today only) */}
            {selectedDay === today && (() => {
              const now = new Date();
              const startH = 9, endH = 18;
              const pct = ((now.getHours() - startH) * 60 + now.getMinutes()) / ((endH - startH) * 60);
              if (pct < 0 || pct > 1) { return null; }
              return (
                <div className="absolute left-0 right-0 h-[2px] bg-[var(--status-error)] z-10" style={{ top: pct * HOURS.length * 60 }}>
                  <div className="absolute left-[-5px] top-[-4px] w-[10px] h-[10px] rounded-full bg-[var(--status-error)]" />
                </div>
              );
            })()}

            {/* Appointment blocks */}
            {dayAppts.map(appt => {
              if (!appt.time) { return null; }
              const [h, m] = appt.time.split(':').map(Number);
              if (isNaN(h) || isNaN(m)) { return null; }
              
              const gridStart = 9, gridEnd = 18;
              const startMin = (h - gridStart) * 60 + m;
              const gridTotalMin = (gridEnd - gridStart) * 60;
              if (startMin < 0 || startMin >= gridTotalMin) { return null; }
              const cfg = TYPE_CONFIG[appt.type] || TYPE_CONFIG['Consultation'];
              const cancelled = appt.status === 'Cancelled';
              return (
                <div key={appt.id}
                  onClick={() => { setSelected(appt); }}
                  className={`absolute left-2 right-2 rounded-lg py-1.25 px-2.5 cursor-pointer z-[5] transition-all duration-150 overflow-hidden border-[1.5px] border-l-[3px] hover:shadow-md ${cancelled ? 'bg-[var(--surface-hover)] border-[var(--surface-border)] opacity-50' : 'opacity-100'}`}
                  style={{
                    top: (startMin / 30) * 30,
                    height: Math.max(((appt.duration || 30) / 30) * 30 - 4, 28),
                    background: cancelled ? undefined : cfg.bg,
                    borderColor: cancelled ? undefined : `${cfg.color}22`,
                    borderLeftColor: cancelled ? undefined : cfg.color,
                  }}
                >
                  <div className="flex items-center gap-1.25">
                    <span style={{ color: cfg.color, opacity: 0.8 }}>
                      <SvgIcon name={cfg.icon} width="14" height="14" />
                    </span>
                    <span className="font-bold text-[0.78rem] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: cfg.color }}>{appt.customer}</span>
                    <span className={`badge ${STATUS_CONFIG[appt.status].cls} text-[0.6rem] ml-auto shrink-0`}>{appt.status}</span>
                  </div>
                  {appt.duration >= 30 && (
                    <div className="text-[0.7rem] text-[var(--text-secondary)] mt-0.5">{appt.type} · {appt.time} · {appt.duration}min</div>
                  )}
                </div>
              );
            })}

            {dayAppts.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-[var(--text-muted)]">
                <SvgIcon name="appointments" width="48" height="48" className="opacity-20" />
                <div className="text-[0.9rem]">No appointments</div>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowNew(true); }}>+ Add Appointment</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="panel p-0 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Time</th><th>Customer</th><th>Type</th><th>Duration</th><th>Assigned</th><th>Status</th><th>Notes</th><th></th></tr>
            </thead>
            <tbody>
              {appointments.slice().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(appt => {
                const cfg = TYPE_CONFIG[appt.type] || TYPE_CONFIG['Consultation'];
                const scfg = STATUS_CONFIG[appt.status];
                const dInfo = fmtDay(appt.date);
                return (
                  <tr key={appt.id} onClick={() => { setSelected(appt); }} className={appt.status === 'Cancelled' ? 'opacity-50' : 'opacity-100'}>
                    <td className="font-semibold text-[0.85rem] whitespace-nowrap">
                      {appt.date === today ? <span className="text-[var(--accent-gold-text)] font-bold">Today</span> : `${dInfo.weekday} ${dInfo.day} ${dInfo.month}`}
                    </td>
                    <td className="font-bold text-[0.85rem] text-[var(--text-primary)] whitespace-nowrap">{appt.time}</td>
                    <td>
                      <div className="font-semibold text-[0.875rem]">{appt.customer}</div>
                      <div className="text-[0.72rem] text-[var(--text-muted)]">{appt.phone}</div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.75rem] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                        <SvgIcon name={cfg.icon} width="14" height="14" />
                        {appt.type}
                      </span>
                    </td>
                    <td className="text-[0.85rem] text-[var(--text-secondary)]">{appt.duration}min</td>
                    <td className="text-[0.82rem]">{appt.assignedTo}</td>
                    <td><span className={`badge ${scfg.cls}`}>{appt.status}</span></td>
                    <td className="max-w-[180px]"><span className="text-[0.75rem] text-[var(--text-muted)] line-clamp-1">{appt.notes ?? '—'}</span></td>
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

      {showNew && <NewApptModal onClose={() => { setShowNew(false); }} defaultDate={selectedDay} />}
    </div>
  );
};

export default Appointments;
