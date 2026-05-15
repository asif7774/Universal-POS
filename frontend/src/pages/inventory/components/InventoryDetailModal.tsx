import React, { useState } from 'react';
import { InventoryItem } from 'types/inventory';
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
  const [editForm, setEditForm] = useState({ name: '', category: '', location: '', lowStockThreshold: 0, salePrice: 0, rentalRate: 0 });
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
      onError: () => showSnackbar('Failed to update product', 'error'),
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
      onError: () => showSnackbar('Failed to update stock', 'error'),
    });
  };

  const handleDelete = () => {
    deleteItem.mutate(selected.id, {
      onSuccess: () => {
        showSnackbar('Product deleted', 'success');
        setShowDeleteConfirm(false);
        setSelected(null);
      },
      onError: () => showSnackbar('Failed to delete product', 'error'),
    });
  };

  const footerContent = () => {
    if (showDeleteConfirm) {
      return (
        <>
          <span style={{ fontSize: '.85rem', color: 'var(--status-error)', fontWeight: 600 }}>Delete this product?</span>
          <button className="btn btn-outline" onClick={() => { setShowDeleteConfirm(false); }}>Cancel</button>
          <button className="btn" style={{ background: 'var(--status-error)', color: 'white' }}
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
          <button className="btn btn-primary" onClick={saveStock} disabled={updateStock.isPending}>
            {updateStock.isPending ? 'Saving...' : 'Apply Stock Changes'}
          </button>
        </>
      );
    }
    return (
      <>
        <button className="btn btn-outline" onClick={startEditing} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <SvgIcon name="tailoring" width="14" height="14" /> Edit
        </button>
        <button className="btn btn-primary" onClick={startStockAdjust} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <SvgIcon name="inventory" width="14" height="14" /> Adjust Stock
        </button>
        <button className="btn btn-ghost btn-sm text-[var(--status-error)]" onClick={() => { setShowDeleteConfirm(true); }}>Delete</button>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
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
        </div>
      ) : mode === 'stock' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
            Enter positive numbers to add stock, negative to remove.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {Object.entries(selected.sizes).map(([size, data]) => (
              <div key={size} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{size}</div>
                <div style={{ fontSize: '.78rem', marginBottom: 6 }}>
                  Current: <strong>{data.available}</strong> / {data.total}
                </div>
                <input className="input" type="number" style={{ textAlign: 'center', fontSize: '.85rem' }}
                  placeholder="+/- 0" value={stockAdjust[size] || ''}
                  onChange={e => { setStockAdjust(s => ({ ...s, [size]: Number(e.target.value) })); }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          <div style={{ display: 'flex', gap: 16, fontSize: '.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} />Available / Total</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--tux-navy)' }} />Out on rental</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#7C3AED' }} />In cleaning</div>
          </div>
        </div>
      )}
    </Modal>
  );
};
