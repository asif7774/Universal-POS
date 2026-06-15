import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { useRevenueReport, useCategorySales, usePaymentMethods } from '../../lib/queries';
import { DailySummary } from 'types/reports';
import { KPICards } from './components/KPICards';
import { RevenueChart } from './components/RevenueChart';
import { PaymentMethodsChart } from './components/PaymentMethodsChart';
import { CategorySalesChart } from './components/CategorySalesChart';
import { RecentTransactions } from './components/RecentTransactions';
import { usePageHeader } from 'contexts/PageHeaderContext';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const today = new Date().toISOString().split('T')[0];

  const { data: summary, isLoading: summaryLoading } = useQuery<DailySummary>({
    queryKey: ['orders-summary', today],
    queryFn: () => apiClient.get(`/orders/summary?date=${today}`),
    refetchInterval: 30000,
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ['orders', 'recent'],
    queryFn: () => apiClient.get('/orders?limit=50'),
    refetchInterval: 30000,
  });

  // Sprint 2 — Live report data from API
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueReport(period);
  const { data: categoryData = [], isLoading: categoryLoading } = useCategorySales(period);
  const { data: paymentData = [], isLoading: paymentLoading } = usePaymentMethods(period);

  const isLoading = summaryLoading || ordersLoading;

  // KPIs
  const revenue = summary?.revenue ?? 0;
  const orderCount = summary?.count ?? 0;
  const rentalCount = summary?.rentalCount ?? 0;
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

  usePageHeader({
    title: 'Advanced Reporting',
    subtitle: `Live analytics · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
    actions: (
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as const).map(p => (
          <button key={p} onClick={() => { setPeriod(p); }}
            className={`btn btn-sm capitalize ${period === p ? 'btn btn-gold btn-sm' : 'btn btn-outline btn-sm'}`}>
            {p}
          </button>
        ))}
      </div>
    ),
  });

  return (
    <div className="animate-fade-in bg-[var(--bg-canvas)]">
      <KPICards 
        isLoading={isLoading} 
        revenue={revenue} 
        orderCount={orderCount} 
        rentalCount={rentalCount} 
        avgOrder={avgOrder} 
        last7DaysTotal={revenueData.reduce((a,b)=>a+b.revenue,0)} 
        recentOrdersCount={recentOrders.length} 
      />

      {/* Main Charts Area */}
      <div className="grid grid-cols-[2fr_1fr] gap-5 mb-5">
        <RevenueChart data={revenueData} isLoading={revenueLoading} />
        <PaymentMethodsChart data={paymentData} isLoading={paymentLoading} />
      </div>

      {/* Secondary Charts Area */}
      <div className="grid grid-cols-2 gap-5">
        <CategorySalesChart data={categoryData} isLoading={categoryLoading} />
        <RecentTransactions orders={recentOrders} isLoading={ordersLoading} />
      </div>

    </div>
  );
};

export default Reports;
