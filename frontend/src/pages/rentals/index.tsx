import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { Rental } from 'types/rentals';
import { RentalTable, daysLeft } from './components/RentalTable';
import { RentalDetailModal } from './components/RentalDetailModal';
import { NewRentalForm } from './components/NewRentalForm';
import { TableSkeleton } from 'components/atoms/skeleton/Skeleton';
import { usePageHeader } from 'contexts/PageHeaderContext';

const Rentals: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
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
    queryFn: () => apiClient.get<{ id: string, firstName: string, lastName: string }[]>('/customers'),
    enabled: isAdding,
  });

  const createRental = useMutation({
    mutationFn: (data: Partial<Rental>) => apiClient.post<Rental>('/rentals', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentals'] });
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
      (r.eventName ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = rentals.reduce<Record<string, number>>((acc, r) => {
    const isOverdue = r.status === 'out' && daysLeft(r.returnDate) < 0;
    const stat = isOverdue ? 'overdue' : r.status;
    acc[stat] = (acc[stat] ?? 0) + 1;
    return acc;
  }, {});

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

  usePageHeader({
    title: isAdding ? 'New Rental' : 'Rental Management',
    subtitle: isAdding ? 'Create a new rental booking' : `${rentals.filter(r => ['booked', 'out'].includes(r.status)).length} active rentals · ${counts['overdue'] ?? 0} overdue`,
    actions: isAdding
      ? (
        <button onClick={() => { setIsAdding(false); }} className="btn btn-outline">
          <SvgIcon name="arrow-left" width="18" height="18" /> Back
        </button>
      )
      : <button className="btn btn-gold" onClick={() => { setIsAdding(true); }}>+ New Rental Booking</button>,
  });

  return (
    <div className="animate-fade-in">
      {!isAdding && (
        <div className="search-container">
          <div className="search-input-wrapper input-with-icon">
            <span className="input-icon">
              <SvgIcon name="search" width="18" height="18" />
            </span>
            <input className="input" placeholder="Search by customer, order, event..." value={search} onChange={e => { setSearch(e.target.value); }} />
          </div>
          <div className="filter-group">
            {statuses.map(s => {
              const count = s === 'all' ? rentals.length : (counts[s] ?? 0);
              return (
                <button key={s} onClick={() => { setStatusFilter(s); }}
                  className={`btn btn-sm capitalize rounded-full ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}>
                  {s === 'overdue' && <SvgIcon name="warning" width="14" height="14" />}
                  {s}
                  {count > 0 && (
                    <span className={`ml-1.5 opacity-80 rounded-full px-1.5 py-0.5 text-[0.7rem] ${statusFilter === s ? 'bg-white/20' : 'bg-[var(--surface-hover)]'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {isAdding ? (
        <NewRentalForm
          customers={customers}
          onSubmit={handleSubmit}
          isPending={createRental.isPending}
          onCancel={() => { setIsAdding(false); }}
        />
      ) : (
        <>
          {isLoading ? (
            <TableSkeleton rows={8} cols={6} />
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
