import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { InventoryItem } from 'types/inventory';
import { SearchableSelect } from 'components/atoms/searchable-select/SearchableSelect';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export interface RentalFormData {
  customerId: string;
  eventName: string;
  pickupDate: string;
  returnDate: string;
  items: { productName: string }[];
  depositPaid: string;
  notes: string;
}

interface NewRentalFormProps {
  customers: { id: string; firstName: string; lastName: string }[];
  onSubmit: (data: RentalFormData) => void;
  isPending: boolean;
  onCancel: () => void;
}

export const NewRentalForm = ({ customers, onSubmit, isPending, onCancel }: NewRentalFormProps) => {
  const [form, setForm] = useState<RentalFormData>({
    customerId: '', eventName: '', pickupDate: '', returnDate: '',
    items: [], depositPaid: '0.00', notes: '',
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: () => apiClient.get<InventoryItem[]>('/inventory'),
    staleTime: 5 * 60 * 1000,
  });

  const customerOptions = customers.map(c => ({
    value: c.id,
    label: `${c.firstName} ${c.lastName}`,
  }));

  const productOptions = inventory.map(item => {
    const avail = Object.values(item.sizes).reduce((s, v) => s + v.available, 0);
    return {
      value: item.id,
      label: item.name,
      sublabel: `${item.sku} · ${avail} available`,
    };
  });

  const set = (k: keyof RentalFormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
  };

  const addItem = (productId: string) => {
    const product = inventory.find(i => i.id === productId);
    if (!product) return;
    if (form.items.some(i => i.productName === product.name)) return;
    setForm(f => ({ ...f, items: [...f.items, { productName: product.name }] }));
  };

  const removeItem = (idx: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const dateError = form.pickupDate && form.returnDate && form.pickupDate > form.returnDate;
  const canSubmit = !!form.customerId && !!form.pickupDate && !!form.returnDate && form.items.length > 0 && !dateError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) onSubmit(form);
  };

  return (
    <div className="panel" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>New Rental Booking</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div className="input-group">
          <label className="input-label">Customer *</label>
          <SearchableSelect
            options={customerOptions}
            value={form.customerId}
            onChange={v => { set('customerId', v); }}
            placeholder="Search and select customer..."
            searchPlaceholder="Type name to search..."
            noOptionsMessage="No customers found — add one first"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Event Name</label>
          <input className="input" placeholder="e.g. Prom – Lincoln HS"
            value={form.eventName} onChange={e => { set('eventName', e.target.value); }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Pickup Date *</label>
            <input className="input" type="date" required
              value={form.pickupDate} onChange={e => { set('pickupDate', e.target.value); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Return Date *</label>
            <input className="input" type="date" required
              value={form.returnDate} onChange={e => { set('returnDate', e.target.value); }} />
          </div>
        </div>
        
        {dateError && (
          <div style={{ color: 'var(--status-error)', fontSize: '.875rem', marginTop: -8 }}>
            Return Date cannot be earlier than Pickup Date.
          </div>
        )}

        {/* Product picker */}
        <div className="input-group">
          <label className="input-label">Rental Items *</label>
          <SearchableSelect
            options={productOptions}
            value=""
            onChange={addItem}
            placeholder="Search inventory to add items..."
            searchPlaceholder="Type name or SKU..."
            noOptionsMessage="No inventory items found"
          />
          {form.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {form.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-panel-hover)', border: '1px solid var(--border-subtle)',
                }}>
                  <SvgIcon name="tuxedo" width="14" height="14" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '.875rem', color: 'var(--text-primary)' }}>{item.productName}</span>
                  <button type="button" onClick={() => { removeItem(i); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)', display: 'flex' }}>
                    <SvgIcon name="close" width="13" height="13" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
              No items added — search above to add rental items.
            </p>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Deposit Paid ($)</label>
          <input className="input" type="number" step="0.01" min="0"
            value={form.depositPaid} onChange={e => { set('depositPaid', e.target.value); }} />
        </div>

        <div className="input-group">
          <label className="input-label">Notes</label>
          <textarea className="input" rows={3} style={{ resize: 'vertical' }}
            value={form.notes} onChange={e => { set('notes', e.target.value); }} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 4, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-gold" disabled={isPending || !canSubmit}>
            {isPending ? 'Booking...' : 'Book Rental'}
          </button>
        </div>
      </form>
    </div>
  );
};
