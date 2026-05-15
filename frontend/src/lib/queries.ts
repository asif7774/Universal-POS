import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import { StoreSettings, StaffMember } from '../types/settings';

// ── Types (mirrors backend) ──────────────────────────────────
export interface Product {
  id: string; sku: string; name: string; type: 'rental' | 'sale' | 'service';
  category: string; salePrice?: number; rentalRatePerDay?: number;
  taxable: boolean; isActive: boolean;
}

export interface Customer {
  id: string; firstName: string; lastName: string;
  email?: string; phone?: string; tags: string[];
  loyaltyPoints: number; totalOrders: number; totalSpent: number;
}

export interface Rental {
  id: string; rentalNo: string; customerId: string; status: string;
  eventName?: string; pickupDate: string; returnDate: string;
  depositPaid: number; lateFeeCharged: number; items: Array<{ productName: string; size?: string }>;
}

export interface Order {
  id: string; orderNo: string; status: string; type: string;
  total: number; paymentMethod?: string; createdAt: string;
  items: Array<{ name: string; qty: number; lineTotal: number; isRental: boolean }>;
}

// ── Query keys ───────────────────────────────────────────────
export const QK = {
  products:    (cat?: string) => ['products', cat] as const,
  categories:  ()             => ['products', 'categories'] as const,
  customers:   (q?: string)  => ['customers', q] as const,
  customer:    (id: string)  => ['customers', id] as const,
  measurements:(id: string)  => ['measurements', id] as const,
  rentals:     (s?: string)  => ['rentals', s] as const,
  rentalStats: ()            => ['rentals', 'stats'] as const,
  overdue:     ()            => ['rentals', 'overdue'] as const,
  orders:      ()            => ['orders'] as const,
  orderSummary:(d?: string)  => ['orders', 'summary', d] as const,
  // Sprint 1 — Foundation
  settings:    ()            => ['settings'] as const,
  staff:       ()            => ['staff'] as const,
  // Sprint 2 — Dashboard & Reports
  dashboardAlerts:    ()                  => ['dashboard', 'alerts'] as const,
  recentOrders:       (limit?: number)    => ['orders', 'recent', limit] as const,
  upcomingRentals:    (limit?: number)    => ['rentals', 'upcoming', limit] as const,
  appointmentCount:   (date?: string)     => ['appointments', 'count', date] as const,
  revenueReport:      (period?: string)   => ['reports', 'revenue', period] as const,
  categorySales:      (period?: string)   => ['reports', 'category-sales', period] as const,
  paymentMethods:     (period?: string)   => ['reports', 'payment-methods', period] as const,
};

// ── Products ─────────────────────────────────────────────────
export const useProducts = (category?: string) =>
  useQuery({
    queryKey: QK.products(category),
    queryFn:  () => apiClient.get<Product[]>(`/products${category ? `?category=${category}` : ''}`),
    staleTime: 5 * 60 * 1000,
  });

export const useCategories = () =>
  useQuery({
    queryKey: QK.categories(),
    queryFn:  () => apiClient.get<string[]>('/products/categories'),
    staleTime: 10 * 60 * 1000,
  });

// ── Customers ─────────────────────────────────────────────────
export const useCustomers = (search?: string) =>
  useQuery({
    queryKey: QK.customers(search),
    queryFn:  () => apiClient.get<Customer[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    staleTime: 2 * 60 * 1000,
  });

export const useCustomer = (id: string) =>
  useQuery({
    queryKey: QK.customer(id),
    queryFn:  () => apiClient.get<Customer>(`/customers/${id}`),
    enabled:  !!id,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Customer>) => apiClient.post<Customer>('/customers', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useAddLoyalty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, points }: { id: string; points: number }) =>
      apiClient.post<Customer>(`/customers/${id}/loyalty`, { points }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

// ── Rentals ───────────────────────────────────────────────────
export const useRentals = (status?: string) =>
  useQuery({
    queryKey: QK.rentals(status),
    queryFn:  () => apiClient.get<Rental[]>(`/rentals${status ? `?status=${status}` : ''}`),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,   // poll every 1 min for overdue updates
  });

export const useRentalStats = () =>
  useQuery({
    queryKey: QK.rentalStats(),
    queryFn:  () => apiClient.get<{ total: number; booked: number; out: number; overdue: number; returned: number }>('/rentals/stats'),
    staleTime: 30 * 1000,
  });

export const useOverdueRentals = () =>
  useQuery({
    queryKey: QK.overdue(),
    queryFn:  () => apiClient.get<Array<Rental & { daysOverdue: number }>>('/rentals/overdue'),
    refetchInterval: 5 * 60 * 1000,
  });

export const useCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch<Rental>(`/rentals/${id}/checkout`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rentals'] }),
  });
};

export const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, condition, damageFee }: { id: string; condition: string; damageFee?: number }) =>
      apiClient.patch<Rental>(`/rentals/${id}/checkin`, { condition, damageFee }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rentals'] }),
  });
};

// ── Orders ────────────────────────────────────────────────────
export const useOrders = () =>
  useQuery({
    queryKey: QK.orders(),
    queryFn:  () => apiClient.get<Order[]>('/orders'),
    staleTime: 60 * 1000,
  });

export const useOrderSummary = (date?: string) =>
  useQuery({
    queryKey: QK.orderSummary(date),
    queryFn:  () => apiClient.get<{ date: string; revenue: number; count: number; rentalCount: number }>(`/orders/summary${date ? `?date=${date}` : ''}`),
    refetchInterval: 60 * 1000,
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiClient.post<Order>('/orders', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['rentals'] });
    },
  });
};

// ── Settings ──────────────────────────────────────────────────
export const useSettings = () =>
  useQuery({
    queryKey: QK.settings(),
    queryFn:  () => apiClient.get<StoreSettings>('/settings'),
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StoreSettings>) => apiClient.put<StoreSettings>('/settings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};

// ── Staff ─────────────────────────────────────────────────────
export const useStaff = () =>
  useQuery({
    queryKey: QK.staff(),
    queryFn:  () => apiClient.get<StaffMember[]>('/staff'),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StaffMember>) => apiClient.post<StaffMember>('/staff', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<StaffMember> & { id: string }) =>
      apiClient.put<StaffMember>(`/staff/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
};

// ── Dashboard (Sprint 2) ─────────────────────────────────────
export interface DashboardAlert {
  type: 'error' | 'warning' | 'info';
  msg: string;
  actionUrl?: string;
}

export const useDashboardAlerts = () =>
  useQuery({
    queryKey: QK.dashboardAlerts(),
    queryFn:  () => apiClient.get<DashboardAlert[]>('/dashboard/alerts'),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

export const useRecentOrders = (limit = 5) =>
  useQuery({
    queryKey: QK.recentOrders(limit),
    queryFn:  () => apiClient.get<Order[]>(`/orders/recent?limit=${limit}`),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

export interface UpcomingRental {
  customer: string;
  item: string;
  event: string;
  date: string;
  deposit: string;
}

export const useUpcomingRentals = (limit = 3) =>
  useQuery({
    queryKey: QK.upcomingRentals(limit),
    queryFn:  () => apiClient.get<UpcomingRental[]>(`/rentals/upcoming?limit=${limit}`),
    staleTime: 60 * 1000,
  });

export const useAppointmentCount = (date?: string) =>
  useQuery({
    queryKey: QK.appointmentCount(date),
    queryFn:  () => apiClient.get<{ count: number }>(`/appointments/count${date ? `?date=${date}` : ''}`),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

// ── Reports (Sprint 2) ───────────────────────────────────────
export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

export const useRevenueReport = (period = 'week') =>
  useQuery({
    queryKey: QK.revenueReport(period),
    queryFn:  () => apiClient.get<RevenueDataPoint[]>(`/reports/revenue?period=${period}`),
    staleTime: 60 * 1000,
  });

export interface CategorySalesPoint {
  name: string;
  value: number;
}

export const useCategorySales = (period = 'week') =>
  useQuery({
    queryKey: QK.categorySales(period),
    queryFn:  () => apiClient.get<CategorySalesPoint[]>(`/reports/category-sales?period=${period}`),
    staleTime: 60 * 1000,
  });

export interface PaymentMethodPoint {
  name: string;
  value: number;
}

export const usePaymentMethods = (period = 'week') =>
  useQuery({
    queryKey: QK.paymentMethods(period),
    queryFn:  () => apiClient.get<PaymentMethodPoint[]>(`/reports/payment-methods?period=${period}`),
    staleTime: 60 * 1000,
  });

// ── Sprint 3: Customer CRUD ──────────────────────────────────
export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Customer> & { id: string }) =>
      apiClient.put<Customer>(`/customers/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

// ── Sprint 3: Tailoring Create ───────────────────────────────
export interface TailoringJobCreate {
  customerName: string;
  garment: string;
  type: string;
  assignedToName: string;
  dueDate: string;
  price: number;
  notes?: string;
}

export const useCreateTailoringJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TailoringJobCreate) => apiClient.post('/tailoring', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tailoring'] }),
  });
};

export const useUpdateTailoringJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<TailoringJobCreate>) =>
      apiClient.put(`/tailoring/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tailoring'] }),
  });
};

// ── Sprint 3: Measurement CRUD ───────────────────────────────
export const useUpdateMeasurement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, measurementId, ...data }: { customerId: string; measurementId: string; [key: string]: unknown }) =>
      apiClient.put(`/customers/${customerId}/measurements/${measurementId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['measurements'] }),
  });
};

export const useDeleteMeasurement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, measurementId }: { customerId: string; measurementId: string }) =>
      apiClient.delete(`/customers/${customerId}/measurements/${measurementId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['measurements'] }),
  });
};

// ── Sprint 3: Inventory CRUD ─────────────────────────────────
export const useUpdateInventoryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: unknown }) =>
      apiClient.put(`/inventory/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
};

export const useDeleteInventoryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/inventory/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
};

export const useUpdateStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sizes }: { id: string; sizes: Record<string, { total: number; available: number; out: number }> }) =>
      apiClient.put(`/inventory/${id}/stock`, { sizes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
};

// ── Sprint 4: Admin ──────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: string;
  users: number;
  revenue: number;
  created: string;
}

export interface AdminStats {
  totalTenants: number;
  activeTerminals: number;
  mrr: number;
  systemHealth: number;
}

export const useAdminTenants = () =>
  useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => apiClient.get<Tenant[]>('/admin/tenants'),
    staleTime: 60 * 1000,
  });

export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.get<AdminStats>('/admin/stats'),
    staleTime: 60 * 1000,
  });

export const useCreateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Tenant>) => apiClient.post<Tenant>('/admin/tenants', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
};

// ── Sprint 4: Returns & Loyalty ──────────────────────────────
export interface ReturnRecord {
  id: string;
  orderNo: string;
  customerName: string;
  reason: string;
  status: string;
  refundAmount: number;
  createdAt: string;
  items: Array<{ name: string; qty: number }>;
}

export const useReturns = () =>
  useQuery({
    queryKey: ['returns'],
    queryFn: () => apiClient.get<ReturnRecord[]>('/returns'),
    staleTime: 60 * 1000,
  });

export const useCreateReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ReturnRecord>) => apiClient.post<ReturnRecord>('/returns', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['returns'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useRedeemLoyalty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, points }: { customerId: string; points: number }) =>
      apiClient.post(`/loyalty/redeem`, { customerId, points }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};
