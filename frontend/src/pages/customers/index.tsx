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
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showSnackbar('Customer added successfully!', 'success');
      setIsAdding(false);
    }
  });

  const filtered = customers.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const q = search.toLowerCase();
    return fullName.includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(search);
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
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} customers · {customers.filter(c => c.tags?.includes('VIP')).length} VIP</p>
        </div>
        {!isAdding && <button className="btn btn-gold" onClick={() => setIsAdding(true)}>+ Add Customer</button>}
      </div>

      {isAdding ? (
        <NewCustomerForm 
          onSubmit={handleSubmit}
          isPending={createCustomer.isPending}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <>
          {/* Search */}
          <div className="input-with-icon" style={{ marginBottom: 20, maxWidth: 420 }}>
            <span className="input-icon">
              <SvgIcon name="search" width="15" height="15" />
            </span>
            <input className="input" placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading customers...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
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
              <div className="empty-state-icon">👤</div>
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
