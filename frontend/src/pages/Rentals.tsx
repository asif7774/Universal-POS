import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

type RentalStatus = 'booked' | 'out' | 'returned' | 'overdue' | 'cancelled';

interface RentalItem {
  productName: string;
  size?: string;
}

interface Rental {
  id: string;
  rentalNo: string;
  customerId: string;
  customer?: { firstName: string; lastName: string; phone: string; email: string };
  eventName: string | null;
  pickupDate: string;
  returnDate: string;
  depositPaid: string | null;
  status: RentalStatus;
  notes?: string | null;
  items?: RentalItem[];
}

const STATUS_CONFIG: Record<RentalStatus, { cls: string; icon: string }> = {
  booked:    { cls: 'rental-booked',    icon: '📅' },
  out:       { cls: 'rental-out',       icon: '🚗' },
  returned:  { cls: 'rental-available', icon: '✅' },
  overdue:   { cls: 'rental-overdue',   icon: '⚠️' },
  cancelled: { cls: 'badge-gray',       icon: '✕' },
};

const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const daysLeft = (returnDate: string) => {
  const diff = Math.ceil((new Date(returnDate).getTime() - Date.now()) / 86400000);
  return diff;
};

const Rentals: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Rental | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const queryClient = useQueryClient();

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: () => apiClient.get<Rental[]>('/rentals'),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiClient.get<{id: string, firstName: string, lastName: string}[]>('/customers'),
    enabled: isAdding,
  });

  const createRental = useMutation({
    mutationFn: (data: Partial<Rental>) => apiClient.post<Rental>('/rentals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setIsAdding(false);
    }
  });

  const statuses = ['all', 'booked', 'out', 'overdue', 'returned', 'cancelled'];

  const filtered = rentals.filter(r => {
    const isOverdue = r.status === 'out' && daysLeft(r.returnDate) < 0;
    const computedStatus = isOverdue ? 'overdue' : r.status;
    const matchStatus = statusFilter === 'all' || computedStatus === statusFilter;
    const customerName = r.customer ? `${r.customer.firstName} ${r.customer.lastName}`.toLowerCase() : '';
    const matchSearch = customerName.includes(search.toLowerCase()) ||
      r.rentalNo.toLowerCase().includes(search.toLowerCase()) ||
      (r.eventName || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = rentals.reduce((acc, r) => {
    const isOverdue = r.status === 'out' && daysLeft(r.returnDate) < 0;
    const stat = isOverdue ? 'overdue' : r.status;
    acc[stat] = (acc[stat] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemStr = formData.get('items') as string;
    const items = itemStr.split(',').map(i => ({ productName: i.trim() })).filter(i => i.productName);

    createRental.mutate({
      customerId: formData.get('customerId') as string,
      eventName: formData.get('eventName') as string,
      pickupDate: formData.get('pickupDate') as string,
      returnDate: formData.get('returnDate') as string,
      depositPaid: formData.get('depositPaid') as string,
      status: 'booked',
      notes: formData.get('notes') as string,
      items,
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Rental Management</h1>
          <p className="page-subtitle">{rentals.length} active rentals · {counts['overdue'] ?? 0} overdue</p>
        </div>
        {!isAdding && <button className="btn btn-gold" onClick={() => setIsAdding(true)}>+ New Rental Booking</button>}
      </div>

      {isAdding ? (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>New Rental Booking</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Customer *</label>
              <select name="customerId" className="input" required>
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Event Name</label>
              <input name="eventName" className="input" placeholder="e.g. Prom - Lincoln HS" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label">Pickup Date *</label>
                <input name="pickupDate" type="date" className="input" required />
              </div>
              <div>
                <label className="label">Return Date *</label>
                <input name="returnDate" type="date" className="input" required />
              </div>
            </div>
            <div>
              <label className="label">Items (comma separated) *</label>
              <input name="items" className="input" placeholder="e.g. Navy Tuxedo 40R, White Shirt" required />
            </div>
            <div>
              <label className="label">Deposit Paid ($)</label>
              <input name="depositPaid" type="number" step="0.01" className="input" defaultValue="0.00" />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea name="notes" className="input" style={{ minHeight: 60 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-gold" disabled={createRental.isPending}>
                {createRental.isPending ? 'Booking...' : 'Book Rental'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Status tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {statuses.map(s => {
              const count = s === 'all' ? rentals.length : (counts[s] ?? 0);
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, border: '1.5px solid',
                    borderColor: statusFilter === s ? 'var(--tux-navy)' : 'var(--surface-border)',
                    background: statusFilter === s ? 'var(--tux-navy)' : 'var(--surface-card)',
                    color: statusFilter === s ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: '.8rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6, textTransform: 'capitalize'
                  }}>
                  {s === 'overdue' ? '⚠️ ' : ''}{s}
                  {count > 0 && (
                    <span style={{
                      background: statusFilter === s ? 'rgba(255,255,255,.25)' : 'var(--surface-hover)',
                      padding: '1px 6px', borderRadius: 999, fontSize: '.7rem', color: statusFilter === s ? 'white' : 'var(--text-primary)'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="input-with-icon" style={{ marginBottom: 16, maxWidth: 400 }}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input className="input" placeholder="Search by customer, order, event..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading rentals...</div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Event</th>
                    <th>Pickup</th>
                    <th>Return</th>
                    <th>Deposit</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const isOverdue = r.status === 'out' && daysLeft(r.returnDate) < 0;
                    const computedStatus = isOverdue ? 'overdue' : r.status;
                    const days = daysLeft(r.returnDate);
                    const cfg = STATUS_CONFIG[computedStatus];
                    const customerName = r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : 'Unknown';
                    const phone = r.customer ? r.customer.phone : '';
                    
                    return (
                      <tr key={r.id} onClick={() => setSelected(r)}>
                        <td><code style={{ fontSize: '.8rem', color: 'var(--tux-navy)', fontWeight: 700 }}>{r.rentalNo}</code></td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{customerName}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{phone}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '.8rem', maxWidth: 160 }}>
                            {r.items && r.items.length > 0 ? r.items[0].productName : 'No items'}
                            {r.items && r.items.length > 1 && <span style={{ color: 'var(--text-muted)' }}> +{r.items.length - 1} more</span>}
                          </div>
                        </td>
                        <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)', maxWidth: 140 }}>{r.eventName}</td>
                        <td style={{ fontSize: '.82rem', whiteSpace: 'nowrap' }}>{fmtDate(r.pickupDate)}</td>
                        <td style={{ fontSize: '.82rem', whiteSpace: 'nowrap' }}>
                          {fmtDate(r.returnDate)}
                          {r.status === 'out' && days < 0 && (
                            <div style={{ fontSize: '.7rem', color: 'var(--status-error)', fontWeight: 700 }}>{Math.abs(days)}d overdue</div>
                          )}
                          {r.status === 'out' && days >= 0 && (
                            <div style={{ fontSize: '.7rem', color: 'var(--status-success)' }}>{days}d left</div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{fmt(r.depositPaid)}</td>
                        <td>
                          <span className={`badge ${cfg.cls}`} style={{ textTransform: 'capitalize' }}>{cfg.icon} {computedStatus}</span>
                          {r.notes && <div style={{ fontSize: '.7rem', color: 'var(--status-warning)', marginTop: 2 }}>⚠ Note</div>}
                        </td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); setSelected(r); }}>View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🎩</div>
                  <p>No rentals found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.rentalNo}</h3>
                <span className={`badge ${STATUS_CONFIG[daysLeft(selected.returnDate) < 0 && selected.status === 'out' ? 'overdue' : selected.status].cls}`} style={{ marginTop: 4, textTransform: 'capitalize' }}>
                  {STATUS_CONFIG[daysLeft(selected.returnDate) < 0 && selected.status === 'out' ? 'overdue' : selected.status].icon} {daysLeft(selected.returnDate) < 0 && selected.status === 'out' ? 'overdue' : selected.status}
                </span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Customer */}
              <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>CUSTOMER</div>
                <div style={{ fontWeight: 700 }}>{selected.customer ? `${selected.customer.firstName} ${selected.customer.lastName}` : 'Unknown'}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{selected.customer?.phone}</div>
              </div>

              {/* Event */}
              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>EVENT</div>
                <div style={{ fontSize: '.9rem' }}>{selected.eventName || 'N/A'}</div>
              </div>

              {/* Items */}
              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>RENTED ITEMS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                      <span>🎩</span>
                      <span style={{ fontSize: '.875rem' }}>{item.productName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates + Financials */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Pickup Date', value: fmtDate(selected.pickupDate) },
                  { label: 'Return Date', value: fmtDate(selected.returnDate) },
                  { label: 'Deposit Paid', value: fmt(selected.depositPaid) },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: '.95rem', fontWeight: 700 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E' }}>
                  ⚠️ {selected.notes}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selected.status === 'out' && <button className="btn btn-primary">Mark as Returned</button>}
              {selected.status === 'booked' && <button className="btn btn-gold">Check Out Items</button>}
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rentals;
