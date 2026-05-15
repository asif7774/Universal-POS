import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { useSnackbar } from 'contexts/SnackbarContext';

interface Measurement {
  chest: string; waist: string; hips: string; inseam: string;
  outseam: string; neck: string; sleeve: string; shoulder: string;
  jacketSize: string; shoeSize: string; notes: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: string | null;
  lastVisitAt: string | null;
  loyaltyPoints: number;
  measurements?: Measurement;
  tags: string[];
  notes?: string | null;
}

const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;
const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';

const MeasurementRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--surface-border)', fontSize: '.85rem' }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontWeight: 700 }}>{value || '-'}</span>
  </div>
);

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
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>New Customer Profile</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label">First Name *</label>
                <input name="firstName" className="input" required autoFocus />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input name="lastName" className="input" required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" className="input" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="phone" type="tel" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input name="tags" className="input" placeholder="e.g. VIP, Prom, Wedding" />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea name="notes" className="input" style={{ minHeight: 80, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-gold" disabled={createCustomer.isPending}>
                {createCustomer.isPending ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </form>
        </div>
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
                <div key={c.id} className="card" style={{ cursor: 'pointer', transition: 'all .15s' }}
                  onClick={() => { setSelected(c); setActiveTab('profile'); }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div className="avatar" style={{ width: 44, height: 44, fontSize: '.9rem', flexShrink: 0, background: c.tags?.includes('VIP') ? 'var(--tux-gold)' : 'var(--tux-navy)', color: c.tags?.includes('VIP') ? 'var(--tux-navy-dark)' : 'white' }}>
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{c.firstName} {c.lastName}</span>
                        {c.tags?.includes('VIP') && <span className="badge badge-gold">VIP</span>}
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: 1 }}>{c.email}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                    </div>
                  </div>

                  <div className="divider" />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                    {[
                      { label: 'Orders', value: c.totalOrders },
                      { label: 'Spent', value: fmt(c.totalSpent) },
                      { label: 'Points', value: c.loyaltyPoints },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{s.value}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {c.tags && c.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                      {c.tags.filter(t => t !== 'VIP').map(tag => (
                        <span key={tag} className={`badge ${tag === 'Overdue' ? 'badge-red' : tag === 'Corporate' ? 'badge-navy' : 'badge-gray'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {c.notes && (
                    <div style={{ marginTop: 8, fontSize: '.75rem', color: 'var(--status-warning)', borderTop: '1px solid var(--surface-border)', paddingTop: 8 }}>
                      ⚠️ {c.notes}
                    </div>
                  )}
                </div>
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

      {/* Customer detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="avatar" style={{ width: 48, height: 48, fontSize: '1rem', background: selected.tags?.includes('VIP') ? 'var(--tux-gold)' : 'var(--tux-navy)', color: selected.tags?.includes('VIP') ? 'var(--tux-navy-dark)' : 'white' }}>
                  {selected.firstName[0]}{selected.lastName[0]}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem' }}>{selected.firstName} {selected.lastName}</h3>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                    {selected.email} · {selected.phone}
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)' }}>
              {(['profile', 'measurements', 'history'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: '10px', border: 'none', background: 'none',
                    cursor: 'pointer', fontWeight: 600, fontSize: '.82rem',
                    textTransform: 'capitalize', letterSpacing: '.02em',
                    color: activeTab === tab ? 'var(--tux-navy)' : 'var(--text-muted)',
                    borderBottom: activeTab === tab ? '2px solid var(--tux-navy)' : '2px solid transparent',
                    transition: 'all .15s',
                  }}>
                  {tab === 'measurements' ? '📐 ' : tab === 'history' ? '📋 ' : '👤 '}{tab}
                </button>
              ))}
            </div>

            <div className="modal-body">
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Member Since', value: fmtDate(selected.createdAt) },
                      { label: 'Last Visit', value: fmtDate(selected.lastVisitAt) },
                      { label: 'Total Orders', value: selected.totalOrders },
                      { label: 'Total Spent', value: fmt(selected.totalSpent) },
                      { label: 'Loyalty Points', value: `${selected.loyaltyPoints} pts` },
                      { label: 'Value as Credit', value: fmt(selected.loyaltyPoints * 0.01) },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: '.95rem', fontWeight: 700 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {selected.tags && selected.tags.length > 0 && (
                    <div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>TAGS</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {selected.tags.map(tag => (
                          <span key={tag} className={`badge ${tag === 'VIP' ? 'badge-gold' : tag === 'Overdue' ? 'badge-red' : tag === 'Corporate' ? 'badge-navy' : 'badge-gray'}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.notes && (
                    <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E' }}>
                      ⚠️ {selected.notes}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'measurements' && (
                measurements && measurements.length > 0 ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                      <div>
                        <MeasurementRow label="Jacket Size" value={measurements[0].jacketSize} />
                        <MeasurementRow label="Chest" value={measurements[0].chest} />
                        <MeasurementRow label="Waist" value={measurements[0].waist} />
                        <MeasurementRow label="Hips" value={measurements[0].hips} />
                        <MeasurementRow label="Shoulder" value={measurements[0].shoulder} />
                      </div>
                      <div>
                        <MeasurementRow label="Neck" value={measurements[0].neck} />
                        <MeasurementRow label="Sleeve" value={measurements[0].sleeve} />
                        <MeasurementRow label="Inseam" value={measurements[0].inseam} />
                        <MeasurementRow label="Outseam" value={measurements[0].outseam} />
                        <MeasurementRow label="Shoe Size" value={measurements[0].shoeSize} />
                      </div>
                    </div>
                    {measurements[0].notes && (
                      <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                        📝 {measurements[0].notes}
                      </div>
                    )}
                    <button className="btn btn-outline" style={{ marginTop: 16, width: '100%' }}>
                      ✏️ Edit Measurements
                    </button>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📐</div>
                    <p>No measurements on file</p>
                    <button className="btn btn-gold" style={{ marginTop: 12 }}>Add Measurements</button>
                  </div>
                )
              )}

              {activeTab === 'history' && (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <p style={{ marginBottom: 4 }}>{selected.totalOrders} orders total</p>
                  <p style={{ fontSize: '.8rem' }}>Full order history coming with API integration</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline">Edit Customer</button>
              <button className="btn btn-gold">+ New Rental</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
