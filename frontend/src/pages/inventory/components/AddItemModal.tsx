import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export const AddItemModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={(
        <>
          <SvgIcon name="inventory" width="20" height="20" style={{ color: 'var(--tux-gold)' }} />
          Add New Product
        </>
      )} 
      maxWidth={500}
    >
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
