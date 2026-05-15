import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { Rental } from 'types/rentals';
import { RentalTable, daysLeft } from './components/RentalTable';
import { RentalDetailModal } from './components/RentalDetailModal';
import { NewRentalForm } from './components/NewRentalForm';

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
        <NewRentalForm 
          customers={customers}
          onSubmit={handleSubmit}
          isPending={createRental.isPending}
          onCancel={() => setIsAdding(false)}
        />
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
              <SvgIcon name="search" width="15" height="15" />
            </span>
            <input className="input" placeholder="Search by customer, order, event..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading rentals...</div>
          ) : (
            <RentalTable filtered={filtered} setSelected={setSelected} />
          )}
        </>
      )}

      {/* Detail Modal */}
      <RentalDetailModal selected={selected} setSelected={setSelected} />
    </div>
  );
};

export default Rentals;
