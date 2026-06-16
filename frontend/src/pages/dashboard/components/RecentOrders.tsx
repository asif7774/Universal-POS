import React from 'react';
import { Link } from 'react-router-dom';
import { RecentOrder } from 'types/dashboard';

export const RecentOrders: React.FC<{ orders: RecentOrder[] }> = ({ orders }) => (
  <div className="panel">
    <div className="panel-header">
      <div>
        <h2 className="panel-title">Recent Orders</h2>
        <p className="panel-subtitle">{orders.length} transactions today</p>
      </div>
      <Link to="/reports" className="btn btn-ghost btn-sm text-[var(--accent-gold-text)] text-xs">
        View all →
      </Link>
    </div>
    {orders.map(order => (
      <div key={order.id} className="table-row">
        <span className="text-sm font-semibold text-[var(--text-primary)] w-[110px]">{order.orderNo}</span>
        <span className="text-sm text-[var(--text-secondary)] flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{order.customer}</span>
        <span className="text-sm font-bold text-[var(--accent-gold-text)] w-[80px] text-right">{order.total}</span>
        <div className="w-[100px] flex justify-end">
          <span className={`badge ${
            order.status === 'completed' || order.status === 'Completed' ? 'badge-success' :
            order.status === 'processing' || order.status === 'Processing' ? 'badge-gold' :
            order.status === 'overdue' || order.status === 'Overdue' ? 'badge-error' : 'badge-neutral'
          }`}>{order.status}</span>
        </div>
      </div>
    ))}
  </div>
);
