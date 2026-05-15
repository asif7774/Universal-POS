import React from 'react';
import { RecentOrder } from 'types/dashboard';
import { STATUS_BADGE } from 'constants/dashboard';

export const RecentOrders: React.FC<{ orders: RecentOrder[] }> = ({ orders }) => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--surface-border)' }}>
      <span className="card-title">Recent Orders</span>
      <a href="/pos" style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 600 }}>View all →</a>
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
            <td><code style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 600 }}>{o.id}</code></td>
            <td style={{ fontWeight: 500 }}>{o.customer}</td>
            <td style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>{o.type}</td>
            <td style={{ fontWeight: 700 }}>{o.total}</td>
            <td><span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-gray'}`}>{o.status}</span></td>
            <td style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{o.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
