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
    <div className="panel h-[350px] flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Recent Transactions</span>
        <Link to="/reports" className="btn btn-outline btn-sm">View All</Link>
      </div>
      <div className="flex-1 overflow-y-auto relative" style={{ padding: isLoading ? '0 16px' : 0 }}>
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)] text-[.8rem]">
                <th className="px-4 py-3 font-semibold">Order #</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map(o => (
                <tr key={o.id} className="table-row">
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{o.orderNo}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className={`badge badge-${o.type === 'rental' ? 'gold' : 'neutral'}`}>{o.type}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-[var(--accent-gold-text)]">${parseFloat(o.total ?? '0').toFixed(2)}</span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-5 text-center text-[var(--text-muted)]">No recent orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
