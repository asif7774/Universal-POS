import React, { useState } from 'react';
import { InventoryItem } from 'types/inventory';
import { ProductImage } from 'components/atoms/ProductImage';
import { useUpdateInventoryItem, useDeleteInventoryItem, useUpdateStock } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { SizeCell } from './SizeCell';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface InventoryDetailModalProps {
  selected: InventoryItem | null;
  setSelected: (item: InventoryItem | null) => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({ selected, setSelected }) => {
  const { showSnackbar } = useSnackbar();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const updateStock = useUpdateStock();

  const [mode, setMode] = useState<'view' | 'edit' | 'stock'>('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', location: '', lowStockThreshold: 0, salePrice: 0, rentalRate: 0, imageUrl: '' });
  const [stockAdjust, setStockAdjust] = useState<Record<string, number>>({});

  if (!selected) {return null;}

  const startEditing = () => {
    setEditForm({
      name: selected.name,
      category: selected.category,
      location: selected.location,
      lowStockThreshold: selected.lowStockThreshold,
      salePrice: selected.salePrice ?? 0,
      rentalRate: selected.rentalRate ?? 0,
      imageUrl: selected.imageUrl ?? '',
    });
    setMode('edit');
  };

  const startStockAdjust = () => {
    const adj: Record<string, number> = {};
    Object.keys(selected.sizes).forEach(size => { adj[size] = 0; });
    setStockAdjust(adj);
    setMode('stock');
  };

  const saveEdit = () => {
    updateItem.mutate({ id: selected.id, ...editForm }, {
      onSuccess: () => {
        showSnackbar('Product updated!', 'success');
        setMode('view');
        setSelected(null);
      },
      onError: () => { showSnackbar('Failed to update product', 'error'); },
    });
  };

  const saveStock = () => {
    const newSizes = { ...selected.sizes };
    Object.entries(stockAdjust).forEach(([size, delta]) => {
      if (delta !== 0 && newSizes[size]) {
        newSizes[size] = {
          ...newSizes[size],
          total: newSizes[size].total + delta,
          available: newSizes[size].available + delta,
        };
      }
    });
    updateStock.mutate({ id: selected.id, sizes: newSizes }, {
      onSuccess: () => {
        showSnackbar('Stock updated!', 'success');
        setMode('view');
        setSelected(null);
      },
      onError: () => { showSnackbar('Failed to update stock', 'error'); },
    });
  };

  const handleDelete = () => {
    deleteItem.mutate(selected.id, {
      onSuccess: () => {
        showSnackbar('Product deleted', 'success');
        setShowDeleteConfirm(false);
        setSelected(null);
      },
      onError: () => { showSnackbar('Failed to delete product', 'error'); },
    });
  };

  const footerContent = () => {
    if (showDeleteConfirm) {
      return (
        <>
          <span className="text-[.85rem] text-[var(--status-error)] font-semibold">Delete this product?</span>
          <button className="btn btn-outline" onClick={() => { setShowDeleteConfirm(false); }}>Cancel</button>
          <button className="btn btn-danger"
            onClick={handleDelete} disabled={deleteItem.isPending}>
            {deleteItem.isPending ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </>
      );
    }
    if (mode === 'edit') {
      return (
        <>
          <button className="btn btn-outline" onClick={() => { setMode('view'); }}>Cancel</button>
          <button className="btn btn-gold" onClick={saveEdit} disabled={updateItem.isPending}>
            {updateItem.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      );
    }
    if (mode === 'stock') {
      return (
        <>
          <button className="btn btn-outline" onClick={() => { setMode('view'); }}>Cancel</button>
          <button className="btn btn-gold" onClick={saveStock} disabled={updateStock.isPending}>
            {updateStock.isPending ? 'Saving...' : 'Apply Stock Changes'}
          </button>
        </>
      );
    }
    return (
      <>
        <button className="btn btn-outline inline-flex items-center gap-1.5">
          <SvgIcon name="tailoring" width="14" height="14" /> Edit
        </button>
        <button className="btn btn-gold inline-flex items-center gap-1.5">
          <SvgIcon name="inventory" width="14" height="14" /> Adjust Stock
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => { setShowDeleteConfirm(true); }}>Delete</button>
      </>
    );
  };

  return (
    <Modal
      isOpen={!!selected}
      onClose={() => { setSelected(null); setMode('view'); setShowDeleteConfirm(false); }}
      title={mode === 'edit' ? `Edit — ${selected.name}` : mode === 'stock' ? `Stock Adjust — ${selected.name}` : selected.name}
      maxWidth={520}
      footer={footerContent()}
    >
      {mode === 'edit' ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="input-group col-span-2">
            <label className="input-label">Product Name</label>
            <input className="input" value={editForm.name} onChange={e => { setEditForm(f => ({ ...f, name: e.target.value })); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Category</label>
            <input className="input" value={editForm.category} onChange={e => { setEditForm(f => ({ ...f, category: e.target.value })); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Location</label>
            <input className="input" value={editForm.location} onChange={e => { setEditForm(f => ({ ...f, location: e.target.value })); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Sale Price ($)</label>
            <input className="input" type="number" step="0.01" value={editForm.salePrice || ''} onChange={e => { setEditForm(f => ({ ...f, salePrice: Number(e.target.value) })); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Rental Rate ($/day)</label>
            <input className="input" type="number" step="0.01" value={editForm.rentalRate || ''} onChange={e => { setEditForm(f => ({ ...f, rentalRate: Number(e.target.value) })); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Low Stock Threshold</label>
            <input className="input" type="number" value={editForm.lowStockThreshold} onChange={e => { setEditForm(f => ({ ...f, lowStockThreshold: Number(e.target.value) })); }} />
          </div>
          <div className="input-group col-span-2">
            <label className="input-label">Product Image URL</label>
            <div className="flex gap-2.5 items-center">
              <input
                className="input"
                placeholder="https://example.com/image.jpg"
                value={editForm.imageUrl}
                onChange={e => { setEditForm(f => ({ ...f, imageUrl: e.target.value })); }}
              />
              <ProductImage
                imageUrl={editForm.imageUrl || undefined}
                category={editForm.category}
                name={editForm.name}
                size="sm"
              />
            </div>
          </div>
        </div>
      ) : mode === 'stock' ? (
        <div className="flex flex-col gap-3.5">
          <p className="text-[.82rem] text-[var(--text-secondary)]">
            Enter positive numbers to add stock, negative to remove.
          </p>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {Object.entries(selected.sizes).map(([size, data]) => (
              <div key={size} className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] px-3 py-2.5 text-center">
                <div className="text-[.75rem] font-bold text-[var(--text-muted)] mb-1.5">{size}</div>
                <div className="text-[.78rem] mb-1.5">
                  Current: <strong>{data.available}</strong> / {data.total}
                </div>
                <input className="input text-center text-[.85rem]"
                  type="number"
                  placeholder="+/- 0" value={stockAdjust[size] || ''}
                  onChange={e => { setStockAdjust(s => ({ ...s, [size]: Number(e.target.value) })); }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <div className="flex gap-4 items-start">
            <ProductImage imageUrl={selected.imageUrl} category={selected.category} name={selected.name} size="md" />
            <div className="flex-1 text-[.82rem] text-[var(--text-secondary)] leading-relaxed">
              <div><strong>SKU:</strong> {selected.sku}</div>
              <div><strong>Type:</strong> {selected.type === 'rental' ? `Rental · ${fmt(selected.rentalRate ?? 0)}/day` : `Sale · ${fmt(selected.salePrice ?? 0)}`}</div>
              <div><strong>Condition:</strong> {selected.condition}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Category', value: selected.category },
              { label: 'Location', value: selected.location },
              { label: 'Low Stock Alert', value: `≤ ${selected.lowStockThreshold} units` },
            ].map(i => (
              <div key={i.label} className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] px-2.5 py-2">
                <div className="text-[.7rem] text-[var(--text-muted)] font-semibold mb-[3px]">{i.label}</div>
                <div className="text-[.875rem] font-bold">{i.value}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[.75rem] text-[var(--text-muted)] font-semibold mb-2.5">SIZE AVAILABILITY</div>
            <div className="flex gap-2.5 flex-wrap">
              {Object.entries(selected.sizes).map(([size, data]) => (
                <div key={size} className="text-center">
                  <div className="text-[.72rem] text-[var(--text-muted)] mb-1 font-semibold">{size}</div>
                  <SizeCell data={data} lowThreshold={selected.lowStockThreshold} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 text-[.75rem] text-[var(--text-muted)] flex-wrap">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-[2px] bg-[#10B981]" />Available / Total</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-[2px] bg-[var(--accent-gold)]" />Out on rental</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-[2px] bg-[#7C3AED]" />In cleaning</div>
          </div>
        </div>
      )}
    </Modal>
  );
};
