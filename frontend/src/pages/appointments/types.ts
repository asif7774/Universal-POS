export type AppointmentType = 'Fitting' | 'Pickup' | 'Return' | 'Consultation' | 'Alteration';
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';

export interface Appointment {
  id: string;
  customer: string;
  phone: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM
  duration: number;  // minutes
  assignedTo: string;
  notes?: string;
  orderId?: string;
}
