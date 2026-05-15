export type RentalStatus = 'booked' | 'out' | 'returned' | 'overdue' | 'cancelled';

export interface RentalItem {
  productName: string;
  size?: string;
}

export interface Rental {
  id: string;
  rentalNo: string;
  customerId: string;
  customer?: { firstName: string; lastName: string; phone: string; email: string };
  eventName: string | null;
  pickupDate: string;
  returnDate: string;
  depositPaid: string | null;
  status: RentalStatus;
  notes?: string | null;
  items?: RentalItem[];
}
