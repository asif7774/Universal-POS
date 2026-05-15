import { MeasurementRecord } from 'types/measurements';

export const FIELDS: Array<{ key: keyof MeasurementRecord; label: string; unit?: string }> = [
  { key: 'jacketSize', label: 'Jacket Size' },
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'neck', label: 'Neck' },
  { key: 'sleeve', label: 'Sleeve' },
  { key: 'inseam', label: 'Inseam' },
  { key: 'outseam', label: 'Outseam' },
  { key: 'shoeSize', label: 'Shoe Size' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight' },
];

export const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
