import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { InventoryItem } from 'types/inventory';
import { AddItemModal } from './components/AddItemModal';
import { InventoryCard } from './components/InventoryCard';
import { InventoryDetailModal } from './components/InventoryDetailModal';
import { Skeleton } from 'components/atoms/skeleton/Skeleton';
import { usePageHeader } from 'contexts/PageHeaderContext';

const Inventory: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<InventoryItem | null>(null);

  const { data: inventory = [], isLoading, error } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => await apiClient.get<InventoryItem[]>('/inventory'),
    staleTime: 0, // always fetch fresh so new products appear immediately
  });

  const CATEGORIES = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filtered = inventory.filter(i => {
    const matchCat = category === 'All' || i.category === category;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Use Number() coercions so string values from JSON don't break arithmetic
  const sizeEntries = (i: InventoryItem) => Object.values(i.sizes).filter(s => Number(s.total) > 0);

  const totalItems    = inventory.reduce((s, i) => s + sizeEntries(i).reduce((a, b) => a + Number(b.total), 0), 0);
  const totalOut      = inventory.reduce((s, i) => s + sizeEntries(i).reduce((a, b) => a + Number(b.out), 0), 0);
  const lowStockItems = inventory.filter(i => {
    const avail = sizeEntries(i).reduce((s, v) => s + Number(v.available), 0);
    const total = sizeEntries(i).reduce((s, v) => s + Number(v.total), 0);
    return avail > 0 && total > 0 && avail / total < 0.2;
  }).length;
  const outOfStock = inventory.filter(i =>
    sizeEntries(i).some(s => Number(s.available) === 0)
  ).length;

  usePageHeader({
    title: 'Inventory',
    subtitle: isLoading ? 'Loading...' : error ? 'Error loading inventory' : `${totalItems} items · ${lowStockItems} low stock`,
    actions: <button className="btn btn-gold" onClick={() => { setIsAdding(true); }}>+ Add Item</button>,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="search-container">
          <div className="grid grid-cols-4 gap-[14px] w-full mb-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={80} className="rounded-[var(--radius-lg)]" />)}
          </div>
          <Skeleton height={42} className="mb-4" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} width={80} height={32} />)}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={100} className="rounded-[var(--radius-lg)]" />)}
        </div>
      </div>
    );
  }
  if (error) { return <div className="p-10 text-center text-red-500">Error loading inventory</div>; }

  return (
    <div className="animate-fade-in bg-[var(--bg-canvas)]">
      <div className="search-container">
        {/* Summary stat cards */}
        <div className="grid grid-cols-4 gap-[14px] w-full mb-2.5">
          {[
            { label: 'Total Items', value: totalItems, color: 'var(--text-primary)', icon: 'inventory' },
            { label: 'Out on Rental', value: totalOut, color: 'var(--text-secondary)', icon: 'rental' },
            { label: 'Low Stock', value: lowStockItems, color: 'var(--status-warning)', icon: 'warning' },
            { label: 'Out of Stock', value: outOfStock, color: 'var(--status-error)', icon: 'warning' },
          ].map(s => (
            <div key={s.label} className="stat-card p-3 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="stat-label text-[0.65rem] mb-0.5">{s.label}</div>
                  <div className="stat-value text-xl" style={{ color: s.color }}>{s.value}</div>
                </div>
                <div className="opacity-60" style={{ color: s.color }}>
                  <SvgIcon name={s.icon} width="20" height="20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="search-input-wrapper input-with-icon">
          <span className="input-icon">
            <SvgIcon name="search" width="18" height="18" />
          </span>
          <input className="input" placeholder="Search SKU or name..." value={search}
            onChange={e => { setSearch(e.target.value); }} />
        </div>
        <div className="filter-group">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); }}
              className={`btn btn-sm ${category === cat ? 'btn-gold' : 'btn-outline'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isAdding && <AddItemModal onClose={() => { setIsAdding(false); }} />}

      {/* Inventory cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 pt-4">
        {filtered.map(item => (
          <InventoryCard
            key={item.id}
            item={item}
            onClick={() => { setSelected(item); }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <SvgIcon name="inventory" width="48" height="48" className="opacity-30" />
          </div>
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
