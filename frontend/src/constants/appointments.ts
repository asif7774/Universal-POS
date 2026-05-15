import { AppointmentType, AppointmentStatus } from 'types/appointments';

export const TODAY = new Date().toISOString().split('T')[0];

export const getDays = () => {
  const days = [];
  for (let i = -1; i < 7; i++) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const DAYS = getDays();
export const HOURS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

export const TYPE_CONFIG: Record<AppointmentType, { color: string; icon: string; bg: string }> = {
  Fitting:      { color: '#1E3A5F', bg: '#EEF2F8', icon: 'shirt' },
  Pickup:       { color: '#D4AF37', bg: '#FDF8E7', icon: 'tuxedo' },
  Return:       { color: '#10B981', bg: '#ECFDF5', icon: 'inventory' },
  Consultation: { color: '#8B5CF6', bg: '#F5F3FF', icon: 'appointments' },
  Alteration:   { color: '#F59E0B', bg: '#FFFBEB', icon: 'tailoring' },
};

export const STATUS_CONFIG: Record<AppointmentStatus, { cls: string; dot: string }> = {
  Scheduled:  { cls: 'badge-navy',   dot: '#1E3A5F' },
  Confirmed:  { cls: 'badge-gold',   dot: '#D4AF37' },
  Completed:  { cls: 'badge-green',  dot: '#10B981' },
  Cancelled:  { cls: 'badge-gray',   dot: '#94A3B8' },
  'No-Show':  { cls: 'badge-red',    dot: '#EF4444' },
};

export const fmtDay = (d: string) => {
  const date = new Date(`${d  }T12:00:00`);
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    day: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    isToday: d === TODAY,
    isPast: d < TODAY,
  };
};
