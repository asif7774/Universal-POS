export interface StatProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  sparkData: number[];
  color?: string;
  colorVariant?: string;
  icon: string;
}

export interface RecentOrder {
  id: string;
  orderNo: string;
  customer: string;
  type: string;
  total: string;
  status: string;
  time: string;
}

export interface UpcomingRental {
  customer: string;
  item: string;
  event: string;
  date: string;
  deposit: string;
}

export interface Alert {
  type: 'warning' | 'error' | 'info';
  msg: string;
}

export interface RentalFleetItem {
  status: string;
  count: number;
  total: number;
}
