import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

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
