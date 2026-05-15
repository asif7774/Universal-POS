import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Modal } from 'components/atoms/modal/Modal';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  type: 'rental' | 'sale';
  sizes: Record<string, { total: number; available: number; out: number; cleaning: number }>;
  rentalRate?: number;
  salePrice?: number;
  lowStockThreshold: number;
  location: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}



const SizeCell: React.FC<{ data: { total: number; available: number; out: number; cleaning: number }; lowThreshold: number }> = ({ data, lowThreshold }) => {
  const isLow = data.available <= lowThreshold;
  return (
    <div style={{
      padding: '6px 8px', borderRadius: 6,
      background: data.available === 0 ? '#FEF2F2' : isLow ? '#FFFBEB' : '#ECFDF5',
      border: `1px solid ${data.available === 0 ? '#FECACA' : isLow ? '#FDE68A' : '#A7F3D0'}`,
      textAlign: 'center', minWidth: 56,
    }}>
      <div style={{ fontWeight: 800, fontSize: '.9rem', color: data.available === 0 ? '#991B1B' : isLow ? '#92400E' : '#065F46' }}>
        {data.available}
      </div>
      <div style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>/ {data.total}</div>
      {data.out > 0 && <div style={{ fontSize: '.6rem', color: 'var(--tux-navy)', fontWeight: 600 }}>{data.out} out</div>}
      {data.cleaning > 0 && <div style={{ fontSize: '.6rem', color: '#7C3AED' }}>{data.cleaning} clean</div>}
    </div>
  );
};

const fmt = (n: number) => `$${n.toFixed(2)}`;

const AddItemModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  
  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      showSnackbar('Product added successfully!', 'success');
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      sku: formData.get('sku'),
      name: formData.get('name'),
      type: formData.get('type'),
      category: formData.get('category'),
      salePrice: Number(formData.get('salePrice')) || 0,
      rentalRatePerDay: Number(formData.get('rentalRatePerDay')) || 0,
      taxable: formData.get('taxable') === 'on',
      trackInventory: true
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="📦 Add New Product" maxWidth={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">SKU *</label>
            <input required name="sku" className="input" placeholder="e.g. TUX-001" />
          </div>
          <div>
            <label className="label">Name *</label>
            <input required name="name" className="input" placeholder="Product name" />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Type *</label>
            <select name="type" className="input">
              <option value="rental">Rental</option>
              <option value="sale">Sale</option>
              <option value="service">Service</option>
            </select>
          </div>
          <div>
            <label className="label">Category *</label>
            <input required name="category" className="input" placeholder="e.g. Tuxedos" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Sale Price</label>
            <input name="salePrice" type="number" step="0.01" className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="label">Rental Rate / Day</label>
            <input name="rentalRatePerDay" type="number" step="0.01" className="input" placeholder="0.00" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem' }}>
            <input type="checkbox" name="taxable" defaultChecked /> Taxable
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-gold" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Inventory: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<InventoryItem | null>(null);

  const { data: inventory = [], isLoading, error } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => await apiClient.get<InventoryItem[]>('/inventory'),
  });

  if (isLoading) return <div className="page-header"><h1 className="page-title">Loading...</h1></div>;
  if (error) return <div className="page-header"><h1 className="page-title" style={{ color: 'red' }}>Error loading inventory</h1></div>;

  const CATEGORIES = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filtered = inventory.filter(i => {
    const matchCat = category === 'All' || i.category === category;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalItems = inventory.reduce((s, i) => s + Object.values(i.sizes).reduce((a, b) => a + b.total, 0), 0);
  const totalOut = inventory.reduce((s, i) => s + Object.values(i.sizes).reduce((a, b) => a + b.out, 0), 0);
  const lowStockItems = inventory.filter(i =>
    Object.values(i.sizes).some(s => s.available <= i.lowStockThreshold && s.available > 0)
  ).length;
  const outOfStock = inventory.filter(i =>
    Object.values(i.sizes).some(s => s.available === 0)
  ).length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{totalItems} total items · {totalOut} currently out · {lowStockItems} low stock · {outOfStock} sizes out of stock</p>
        </div>
        <button className="btn btn-gold" onClick={() => setIsAdding(true)}>+ Add Item</button>
      </div>

      {isAdding && <AddItemModal onClose={() => setIsAdding(false)} />}

      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Items', value: totalItems, color: 'var(--tux-navy)', icon: '📦' },
          { label: 'Out on Rental', value: totalOut, color: 'var(--tux-navy-light)', icon: '🚗' },
          { label: 'Low Stock', value: lowStockItems, color: 'var(--status-warning)', icon: '⚠️' },
          { label: 'Out of Stock', value: outOfStock, color: 'var(--status-error)', icon: '🔴' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
              <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-with-icon" style={{ maxWidth: 300 }}>
          <span className="input-icon">
            <SvgIcon name="search" width="15" height="15" />
          </span>
          <input className="input" placeholder="Search SKU or name..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(item => {
          const totalAvail = Object.values(item.sizes).reduce((s, v) => s + v.available, 0);
          const totalAll = Object.values(item.sizes).reduce((s, v) => s + v.total, 0);
          const hasLow = Object.values(item.sizes).some(s => s.available <= item.lowStockThreshold && s.available > 0);
          const hasOut = Object.values(item.sizes).some(s => s.available === 0);

          return (
            <div key={item.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(item)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, background: 'var(--surface-hover)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    {item.category === 'Tuxedos' ? '🎩' : item.category === 'Shoes' ? '👞' : item.category === 'Accessories' ? '🎀' : '📦'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{item.name}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                      {item.sku} · {item.location} · {item.condition}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  {hasLow && <span className="badge badge-yellow">⚠ Low Stock</span>}
                  {hasOut && <span className="badge badge-red">● Out of Stock</span>}
                  <span className={`badge ${item.type === 'rental' ? 'badge-gold' : 'badge-navy'}`}>
                    {item.type === 'rental' ? `Rental ${fmt(item.rentalRate ?? 0)}/day` : `Sale ${fmt(item.salePrice ?? 0)}`}
                  </span>
                </div>
              </div>

              {/* Size grid */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(item.sizes).map(([size, data]) => (
                  <div key={size} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600 }}>{size}</div>
                    <SizeCell data={data} lowThreshold={item.lowStockThreshold} />
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 6 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Total Available</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--tux-navy)' }}>{totalAvail} / {totalAll}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>No inventory items found</p>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.name}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'SKU', value: selected.sku },
                  { label: 'Category', value: selected.category },
                  { label: 'Type', value: selected.type === 'rental' ? `Rental — ${fmt(selected.rentalRate ?? 0)}/day` : `Sale — ${fmt(selected.salePrice ?? 0)}` },
                  { label: 'Condition', value: selected.condition },
                  { label: 'Location', value: selected.location },
                  { label: 'Low Stock Alert', value: `≤ ${selected.lowStockThreshold} units` },
                ].map(i => (
                  <div key={i.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>{i.label}</div>
                    <div style={{ fontSize: '.875rem', fontWeight: 700 }}>{i.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>SIZE AVAILABILITY</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {Object.entries(selected.sizes).map(([size, data]) => (
                    <div key={size} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{size}</div>
                      <SizeCell data={data} lowThreshold={selected.lowStockThreshold} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, fontSize: '.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} />Available / Total</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--tux-navy)' }} />Out on rental</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#7C3AED' }} />In cleaning</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline">Edit</button>
              <button className="btn btn-primary">Adjust Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
