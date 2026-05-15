export interface MeasurementRecord {
  id: string;
  customerId: string;
  customerName: string;
  takenBy: string;
  date: string;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
  outseam: string;
  neck: string;
  sleeve: string;
  shoulder: string;
  jacketSize: string;
  shoeSize: string;
  weight?: string;
  height?: string;
  notes: string;
  fittingNotes?: string;
}
