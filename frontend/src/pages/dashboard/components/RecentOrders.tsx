import React from 'react';
import { RecentOrder } from 'types/dashboard';

const STATUS_BADGE: Record<string, string> = {
  Completed: 'badge-green', Out: 'badge-navy', Processing: 'badge-yellow',
  Booked: 'badge-gold', Overdue: 'badge-red',
};

export const RecentOrders: React.FC<{ orders: RecentOrder[] }> = ({ orders }) => (
  <div className="card p-0 overflow-hidden">
    <div className="card-header py-4 px-5 border-b border-[var(--surface-border)]">
      <span className="card-title">Recent Orders</span>
      <a href="/pos" className="text-[0.8rem] text-[var(--tux-navy)] font-semibold no-underline hover:underline">View all →</a>
    </div>
    <table className="data-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Type</th>
          <th>Total</th>
          <th>Status</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(o => (
          <tr key={o.id}>
            <td><code className="text-[0.8rem] text-[var(--tux-navy)] font-semibold">{o.id}</code></td>
            <td className="font-medium">{o.customer}</td>
            <td className="text-[var(--text-secondary)] text-[0.85rem]">{o.type}</td>
            <td className="font-bold">{o.total}</td>
            <td><span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-gray'}`}>{o.status}</span></td>
            <td className="text-[var(--text-muted)] text-[0.8rem]">{o.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
