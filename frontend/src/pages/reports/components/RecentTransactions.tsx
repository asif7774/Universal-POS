import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from 'types/reports';
import { TableSkeleton } from 'components/atoms/skeleton/Skeleton';

interface RecentTransactionsProps {
  orders: Order[];
  isLoading?: boolean;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ orders, isLoading }) => {
  return (
    <div className="panel" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Recent Transactions</span>
        <Link to="/reports" className="btn btn-outline btn-sm">View All</Link>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: isLoading ? '0 16px' : 0 }}>
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Order #</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map(o => (
                <tr key={o.id} className="table-row">
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{o.orderNo}</td>
                  <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                    <span className={`badge badge-${o.type === 'rental' ? 'gold' : 'neutral'}`}>{o.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span className="font-bold text-[var(--accent-gold-text)]">${parseFloat(o.total ?? '0').toFixed(2)}</span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
