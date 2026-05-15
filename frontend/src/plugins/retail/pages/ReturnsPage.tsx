import React, { useState } from 'react';
import { useReturns } from '../../../lib/queries';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { ProcessReturnModal } from './ProcessReturnModal';

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-gold',
  approved: 'badge-green',
  rejected: 'badge-red',
  refunded: 'badge-navy',
};

export const ReturnsPage: React.FC = () => {
  const { data: returns = [], isLoading } = useReturns();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  const filtered = returns.filter(r =>
    r.orderNo.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Returns & Exchanges</h1>
          <p className="page-subtitle">
            {returns.length} total returns ·
            {returns.filter(r => r.status === 'pending').length} pending review
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => { setShowNew(true); }}>
          <SvgIcon name="return" width="16" height="16" /> Process Return
        </button>
      </div>

      <div className="search-container mb-5">
        <div className="search-input-wrapper input-with-icon">
          <span className="input-icon">
            <SvgIcon name="search" width="18" height="18" />
          </span>
          <input className="input" placeholder="Search by order # or customer..."
            value={search} onChange={e => { setSearch(e.target.value); }} />
        </div>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-[var(--text-muted)]">Loading returns...</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Items</th>
                <th>Refund Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><code className="text-[0.8rem] text-[var(--tux-navy)] font-bold">{r.orderNo}</code></td>
                  <td className="font-semibold">{r.customerName}</td>
                  <td className="text-[var(--text-secondary)] text-[0.85rem]">{r.reason}</td>
                  <td className="text-[0.85rem]">
                    {r.items.map(i => `${i.name} (×${i.qty})`).join(', ')}
                  </td>
                  <td className="font-bold text-[var(--status-error)]">
                    ${r.refundAmount.toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[r.status] || 'badge-gray'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="text-[0.82rem] text-[var(--text-secondary)]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm">View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-10 text-[var(--text-muted)]">
                    {search ? 'No returns match your search' : 'No returns recorded yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showNew && <ProcessReturnModal onClose={() => { setShowNew(false); }} />}
    </div>
  );
};
