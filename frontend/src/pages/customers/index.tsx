import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Customer, Measurement } from 'types/customers';
import { CustomerCard } from './components/CustomerCard';
import { NewCustomerForm } from './components/NewCustomerForm';
import { CustomerDetailModal } from './components/CustomerDetailModal';

const Customers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'measurements' | 'history'>('profile');
  const [isAdding, setIsAdding] = useState(false);
  
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiClient.get<Customer[]>('/customers'),
  });

  const { data: measurements } = useQuery({
    queryKey: ['measurements', selected?.id],
    queryFn: () => apiClient.get<Measurement[]>(`/customers/${selected?.id}/measurements`),
    enabled: !!selected && activeTab === 'measurements',
  });

  const createCustomer = useMutation({
    mutationFn: (data: Partial<Customer>) => apiClient.post<Customer>('/customers', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] });
      showSnackbar('Customer added successfully!', 'success');
      setIsAdding(false);
    }
  });

  const filtered = customers.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const q = search.toLowerCase();
    return fullName.includes(q) || (c.email ?? '').toLowerCase().includes(q) || (c.phone ?? '').includes(search);
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCustomer.mutate({
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      notes: formData.get('notes') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-4">
          {isAdding && (
            <button onClick={() => { setIsAdding(false); }} className="btn btn-icon btn-ghost -ml-2">
              <SvgIcon name="arrow-left" width="22" height="22" />
            </button>
          )}
          <div>
            <h1 className="page-title">{isAdding ? 'Add Customer' : 'Customers'}</h1>
            <p className="page-subtitle">{isAdding ? 'Register a new customer profile' : `${customers.length} customers · ${customers.filter(c => c.tags.includes('VIP')).length} VIP`}</p>
          </div>
        </div>
        {!isAdding && <button className="btn btn-gold" onClick={() => { setIsAdding(true); }}>+ Add Customer</button>}
      </div>

      {!isAdding && (
        <div className="search-container">
          <div className="search-input-wrapper input-with-icon">
            <span className="input-icon">
              <SvgIcon name="search" width="18" height="18" />
            </span>
            <input className="input" placeholder="Search by name, email, phone..." value={search} onChange={e => { setSearch(e.target.value); }} />
          </div>
        </div>
      )}

      {isAdding ? (
        <NewCustomerForm 
          onSubmit={handleSubmit}
          isPending={createCustomer.isPending}
          onCancel={() => { setIsAdding(false); }}
        />
      ) : (
        <>
          {isLoading ? (
            <div className="p-10 text-center text-[var(--text-muted)]">Loading customers...</div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {filtered.map(c => (
                <CustomerCard 
                  key={c.id}
                  c={c}
                  onClick={() => { setSelected(c); setActiveTab('profile'); }}
                />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <SvgIcon name="user" width="48" height="48" className="opacity-30" />
              </div>
              <p>No customers found</p>
            </div>
          )}
        </>
      )}

      <CustomerDetailModal 
        selected={selected}
        setSelected={setSelected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        measurements={measurements}
      />
    </div>
  );
};

export default Customers;
