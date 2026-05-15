export interface Order {
  id: string;
  orderNo: string;
  status: string;
  type: string;
  total: string | null;
  subtotal: string | null;
  taxAmt: string | null;
  discountAmt: string | null;
  paymentMethod: string | null;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  revenue: number;
  count: number;
  rentalCount: number;
  orders: Order[];
}
