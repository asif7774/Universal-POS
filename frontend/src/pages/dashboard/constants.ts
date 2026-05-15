import { RecentOrder, UpcomingRental, Alert } from './types';

export const RECENT_ORDERS: RecentOrder[] = [
  { id: 'ORD-1024', customer: 'Marcus Johnson', type: 'Rental + Tailoring', total: '$340', status: 'Completed', time: '2 min ago' },
  { id: 'ORD-1023', customer: 'David Williams', type: 'Tuxedo Rental', total: '$180', status: 'Out', time: '18 min ago' },
  { id: 'ORD-1022', customer: 'Robert Chen', type: 'Purchase', total: '$520', status: 'Completed', time: '42 min ago' },
  { id: 'ORD-1021', customer: 'James Thompson', type: 'Alteration Only', total: '$85', status: 'Processing', time: '1 hr ago' },
  { id: 'ORD-1020', customer: 'Kevin Park', type: 'Group Booking (4)', total: '$890', status: 'Booked', time: '2 hr ago' },
];

export const UPCOMING_RENTALS: UpcomingRental[] = [
  { customer: 'Alex Rivera', item: 'Black Slim Tuxedo (42R)', event: "Wedding — Sarah's Banquet Hall", date: 'May 15', deposit: '$200' },
  { customer: 'Michael Lee', item: 'Navy Suit (40R)', event: 'Prom — Central HS', date: 'May 16', deposit: '$150' },
  { customer: 'Carlos Mendez', item: 'White Tuxedo (44L)', event: 'Anniversary Gala', date: 'May 18', deposit: '$200' },
];

export const ALERTS: Alert[] = [
  { type: 'warning', msg: 'ORD-1020: Kevin Park pick-up tomorrow — 4 suits pending alterations' },
  { type: 'error',   msg: '2 rentals overdue: Marcus D. (3 days), Tom H. (1 day)' },
  { type: 'info',    msg: 'Low stock: Black Slim Tuxedo size 38R — only 1 remaining' },
];

export const STATUS_BADGE: Record<string, string> = {
  Completed: 'badge-green', Out: 'badge-navy', Processing: 'badge-yellow',
  Booked: 'badge-gold', Overdue: 'badge-red',
};
