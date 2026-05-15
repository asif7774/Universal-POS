import React from 'react';
import { Order } from 'types/reports';

interface RecentTransactionsProps {
  orders: Order[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ orders }) => {
  return (
    <div className="card" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <span className="card-title">Recent Transactions</span>
        <button className="btn btn-outline btn-sm">View All</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Order #</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Time</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 6).map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '.9rem' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--tux-navy)' }}>{o.orderNo}</td>
                <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                  <span className={`badge badge-${o.type === 'rental' ? 'gold' : 'gray'}`}>{o.type}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>
                  ${parseFloat(o.total ?? '0').toFixed(2)}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
