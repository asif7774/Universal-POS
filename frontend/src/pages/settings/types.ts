export type SettingsTabType = string;

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'cashier';
  isActive: boolean;
  lastLogin: string;
  pin?: string;
}

export interface StoreSettings {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  taxRate: string;
  currency: string;
  timezone: string;
  lateFeePerDay: string;
  depositPct: string;
  rentalBuffer: string;
}
