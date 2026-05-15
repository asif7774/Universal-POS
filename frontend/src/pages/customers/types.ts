export interface Measurement {
  chest: string; waist: string; hips: string; inseam: string;
  outseam: string; neck: string; sleeve: string; shoulder: string;
  jacketSize: string; shoeSize: string; notes: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: string | null;
  lastVisitAt: string | null;
  loyaltyPoints: number;
  measurements?: Measurement;
  tags: string[];
  notes?: string | null;
}
