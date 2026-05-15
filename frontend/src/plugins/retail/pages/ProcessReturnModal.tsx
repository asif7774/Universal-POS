import React, { useState } from 'react';
import { useCreateReturn } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const ProcessReturnModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { showSnackbar } = useSnackbar();
  const createReturn = useCreateReturn();

  const [form, setForm] = useState({
    orderNo: '',
    customerName: '',
    reason: 'Size issue',
    items: [{ name: '', qty: 1 }],
    refundAmount: 0,
  });

  const set = (k: string, v: string | number) => { setForm(f => ({ ...f, [k]: v })); };

  const updateItem = (index: number, key: string, value: string | number) => {
    setForm(f => {
      const items = [...f.items];
      items[index] = { ...items[index], [key]: value };
      return { ...f, items };
    });
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { name: '', qty: 1 }] }));
  };

  const removeItem = (index: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = () => {
    if (!form.orderNo || !form.customerName) {
      showSnackbar('Order # and customer name are required', 'error');
      return;
    }
    if (form.items.some(i => !i.name)) {
      showSnackbar('Please fill in all item names', 'error');
      return;
    }
    createReturn.mutate(form, {
      onSuccess: () => {
        showSnackbar('Return processed successfully!', 'success');
        onClose();
      },
      onError: () => showSnackbar('Failed to process return', 'error'),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <>
          <SvgIcon name="return" width="20" height="20" style={{ color: 'var(--tux-gold)' }} />
          Process Return
        </>
      }
      maxWidth={520}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={createReturn.isPending}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSubmit} disabled={createReturn.isPending}>
            {createReturn.isPending ? 'Processing...' : 'Submit Return'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="input-group">
            <label className="input-label">Order # *</label>
            <input className="input" placeholder="e.g. ORD-001" value={form.orderNo}
              onChange={e => { set('orderNo', e.target.value); }} />
          </div>
          <div className="input-group">
            <label className="input-label">Customer Name *</label>
            <input className="input" placeholder="John Smith" value={form.customerName}
              onChange={e => { set('customerName', e.target.value); }} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Reason</label>
          <select className="input" value={form.reason} onChange={e => { set('reason', e.target.value); }}>
            {['Size issue', 'Damaged', 'Wrong item', 'Changed mind', 'Late delivery', 'Other'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="input-label" style={{ margin: 0 }}>Return Items</label>
            <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
          </div>
          {form.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
              <div className="input-group" style={{ flex: 2 }}>
                {i === 0 && <label className="input-label">Item Name</label>}
                <input className="input" placeholder="e.g. Slim Fit Tuxedo" value={item.name}
                  onChange={e => { updateItem(i, 'name', e.target.value); }} />
              </div>
              <div className="input-group" style={{ flex: 0, minWidth: 60 }}>
                {i === 0 && <label className="input-label">Qty</label>}
                <input className="input" type="number" min={1} value={item.qty}
                  onChange={e => { updateItem(i, 'qty', Number(e.target.value)); }}
                  style={{ textAlign: 'center' }} />
              </div>
              {form.items.length > 1 && (
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { removeItem(i); }}
                  style={{ height: 38, color: 'var(--status-error)' }}>
                  <SvgIcon name="close" width="14" height="14" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="input-group">
          <label className="input-label">Refund Amount ($)</label>
          <input className="input" type="number" step="0.01" placeholder="0.00" value={form.refundAmount || ''}
            onChange={e => { set('refundAmount', Number(e.target.value)); }} />
        </div>
      </div>
    </Modal>
  );
};
