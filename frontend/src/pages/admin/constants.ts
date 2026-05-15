import { Tenant } from './types';

export const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'TuxedoPOS HQ', domain: 'tuxedo', status: 'active', users: 4, revenue: 15400, created: '2025-10-12' },
  { id: 't2', name: 'Marios Pizzeria', domain: 'restaurant', status: 'active', users: 12, revenue: 32100, created: '2026-01-05' },
  { id: 't3', name: 'Bella Salon', domain: 'salon', status: 'onboarding', users: 2, revenue: 0, created: '2026-05-10' },
  { id: 't4', name: 'QuickMart', domain: 'grocery', status: 'suspended', users: 5, revenue: 4200, created: '2025-11-20' },
];
