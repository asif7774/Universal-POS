import { AppointmentType, AppointmentStatus } from 'types/appointments';

// TODAY and DAYS are intentionally removed — computing them at module-load time
// from the client clock means they freeze the wrong date if the app stays open
// overnight, and can be trivially spoofed. Consumers receive `today` from the
// server via useServerTime() and pass it into fmtDay().

export const HOURS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

export const TYPE_CONFIG: Record<AppointmentType, { color: string; icon: string; bg: string }> = {
  Fitting:      { color: '#1E3A5F', bg: '#EEF2F8', icon: 'shirt' },
  Pickup:       { color: '#D4AF37', bg: '#FDF8E7', icon: 'tuxedo' },
  Return:       { color: '#10B981', bg: '#ECFDF5', icon: 'inventory' },
  Consultation: { color: '#8B5CF6', bg: '#F5F3FF', icon: 'appointments' },
  Alteration:   { color: '#F59E0B', bg: '#FFFBEB', icon: 'tailoring' },
};

export const STATUS_CONFIG: Record<AppointmentStatus, { cls: string; dot: string }> = {
  Scheduled:  { cls: 'badge-gold',    dot: '#D4AF37' },
  Confirmed:  { cls: 'badge-success', dot: '#10B981' },
  Completed:  { cls: 'badge-emerald', dot: '#10B981' },
  Cancelled:  { cls: 'badge-error',   dot: '#EF4444' },
  'No-Show':  { cls: 'badge-neutral', dot: '#94A3B8' },
};

// today must be passed in from the server-authoritative date, never from new Date()
export const fmtDay = (d: string, today = '') => {
  const date = new Date(`${d}T12:00:00Z`);
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    day: date.getUTCDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    isToday: d === today,
    isPast: today ? d < today : false,
  };
};
