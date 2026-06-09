import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { useSnackbar } from 'contexts/SnackbarContext';
import { MeasurementRecord } from 'types/measurements';
import { SearchableSelect } from 'components/atoms/searchable-select/SearchableSelect';

export const NewMeasurementModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState<Partial<MeasurementRecord>>({});
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); };

  const { data: customers = [] } = useQuery<{id: string, firstName: string, lastName: string}[]>({
    queryKey: ['customers'],
    queryFn: async () => await apiClient.get('/customers'),
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<MeasurementRecord>) => {
      const customerId = data.customerId;
      if (!customerId) {throw new Error("Customer ID is required");}
      return await apiClient.post(`/customers/${customerId}/measurements`, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['measurements'] });
      showSnackbar('Measurement record saved successfully!', 'success');
      onClose();
    },
    onError: (err: Error) => {
      showSnackbar(err.message === 'Customer ID is required' ? 'Please select a customer.' : 'Failed to save measurement.', 'error');
    },
  });

  const inputFields = [
    { key: 'jacketSize', label: 'Jacket Size', placeholder: '42R', type: 'text' },
    { key: 'chest', label: 'Chest', placeholder: '42"', type: 'text' },
    { key: 'waist', label: 'Waist', placeholder: '36"', type: 'text' },
    { key: 'hips', label: 'Hips', placeholder: '42"', type: 'text' },
    { key: 'shoulder', label: 'Shoulder Width', placeholder: '19"', type: 'text' },
    { key: 'neck', label: 'Neck', placeholder: '16"', type: 'text' },
    { key: 'sleeve', label: 'Sleeve', placeholder: '34"', type: 'text' },
    { key: 'inseam', label: 'Inseam', placeholder: '32"', type: 'text' },
    { key: 'outseam', label: 'Outseam', placeholder: '42"', type: 'text' },
    { key: 'shoeSize', label: 'Shoe Size', placeholder: '10.5', type: 'text' },
    { key: 'height', label: 'Height', placeholder: "6'1\"", type: 'text' },
    { key: 'weight', label: 'Weight', placeholder: '185 lbs', type: 'text' },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={(
        <>
          <SvgIcon name="measurements" width="20" height="20" style={{ color: 'var(--tux-gold)' }} />
          New Measurement Record
        </>
      )}
      maxWidth={560}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>Cancel</button>
          <button className="btn btn-gold" onClick={() => { mutation.mutate(form); }} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Measurements'}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Select Customer</label>
          <SearchableSelect
            options={customers.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
            value={form.customerId ?? ''}
            onChange={v => { set('customerId', v); }}
            placeholder="Search and select customer..."
            searchPlaceholder="Type name to search..."
            noOptionsMessage="No customers found"
          />
        </div>
        {inputFields.map(f => (
          <div key={f.key} className="input-group">
            <label className="input-label">{f.label}</label>
            <input
              className="input" type={f.type} placeholder={f.placeholder}
              value={(form as Record<string, string>)[f.key] ?? ''}
              onChange={e => { set(f.key, e.target.value); }}
            />
          </div>
        ))}
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Fitting Notes</label>
          <textarea
            className="input" placeholder="Any special notes about fit, alterations needed, etc."
            rows={3} style={{ resize: 'vertical' }}
            value={form.fittingNotes ?? ''}
            onChange={e => { set('fittingNotes', e.target.value); }}
          />
        </div>
      </div>
    </Modal>
  );
};
