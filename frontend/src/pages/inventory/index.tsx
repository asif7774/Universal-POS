import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { InventoryItem } from 'types/inventory';
import { AddItemModal } from './components/AddItemModal';
import { InventoryCard } from './components/InventoryCard';
import { InventoryDetailModal } from './components/InventoryDetailModal';

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
        {filtered.map(item => (
          <InventoryCard 
            key={item.id} 
            item={item} 
            onClick={() => setSelected(item)} 
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>No inventory items found</p>
        </div>
      )}

      {/* Detail modal */}
      <InventoryDetailModal 
        selected={selected} 
        setSelected={setSelected} 
      />
    </div>
  );
};

export default Inventory;
