import { StaffMember } from './types';

export const STAFF: StaffMember[] = [
  { id: 'u1', name: 'James Miller',  email: 'admin@tuxedopos.com',   role: 'owner',   isActive: true, lastLogin: 'Today 3:47 AM' },
  { id: 'u2', name: 'Sarah Connor',  email: 'manager@tuxedopos.com', role: 'manager', isActive: true, lastLogin: 'Today 2:10 AM' },
  { id: 'u3', name: 'Tom Baker',     email: 'cashier@tuxedopos.com', role: 'cashier', isActive: true, lastLogin: 'Yesterday',    pin: '••••••' },
  { id: 'u4', name: 'Tony Russo',    email: 'tony@tuxedopos.com',    role: 'cashier', isActive: false, lastLogin: '3 days ago',  pin: '••••••' },
];

export const ROLE_BADGE: Record<string, string> = { owner: 'badge-gold', manager: 'badge-navy', cashier: 'badge-gray' };
