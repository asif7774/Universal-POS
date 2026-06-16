import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { useStaff, useServerTime } from '../../../lib/queries';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { AppointmentType } from 'types/appointments';
import { HOURS } from 'constants/appointments';

import { useSnackbar } from '../../../contexts/SnackbarContext';

export const NewApptModal: React.FC<{ onClose: () => void; defaultDate?: string }> = ({ onClose, defaultDate }) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { data: staffMembers = [] } = useStaff();
  const { data: serverTime } = useServerTime();
  const todayServerDate = serverTime?.date ?? new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ customer: '', phone: '', type: 'Fitting' as AppointmentType, date: defaultDate ?? todayServerDate, time: '10:00', duration: 30, assignedTo: '', notes: '' });
  const set = (k: string, v: string | number) => { setForm(f => ({ ...f, [k]: v })); };

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiClient.post('/appointments', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      showSnackbar('Appointment booked successfully!', 'success');
      onClose();
    },
    onError: (err: any) => {
      showSnackbar(err.response?.data?.message || 'Failed to book appointment', 'error');
    }
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide-up max-w-[480px]" onClick={e => { e.stopPropagation(); }}>
        <div className="modal-header">
          <h3 className="font-['Playfair_Display',serif] text-[1.1rem] flex items-center gap-2">
            <SvgIcon name="appointments" width="18" height="18" className="text-[var(--accent-gold)]" />
            New Appointment
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <SvgIcon name="close" width="16" height="16" />
          </button>
        </div>
        <div className="modal-body flex flex-col gap-[14px]">
          <div className="grid grid-cols-2 gap-3">
            <div className="input-group col-span-full">
              <label className="input-label">Customer Name</label>
              <input className="input" placeholder="John Smith" value={form.customer} onChange={e => { set('customer', e.target.value); }} />
            </div>
            <div className="input-group">
              <label className="input-label">Phone</label>
              <input className="input" placeholder="(555) 000-0000" value={form.phone} onChange={e => { set('phone', e.target.value); }} />
            </div>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="input" value={form.type} onChange={e => { set('type', e.target.value as AppointmentType); }}>
                {(['Fitting','Pickup','Return','Consultation','Alteration'] as AppointmentType[]).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => { set('date', e.target.value); }} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <select className="input" value={form.time} onChange={e => { set('time', e.target.value); }}>
                {HOURS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Duration (min)</label>
              <select className="input" value={form.duration} onChange={e => { set('duration', Number(e.target.value)); }}>
                {[15,20,30,45,60,90].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div className="input-group col-span-full">
              <label className="input-label">Assigned Staff</label>
              <select className="input" value={form.assignedTo} onChange={e => { set('assignedTo', e.target.value); }}>
                <option value="" disabled>Select staff member...</option>
                {staffMembers.filter(s => s.isActive).map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>
            <div className="input-group col-span-full">
              <label className="input-label">Notes</label>
              <textarea className="input resize-y" rows={2} placeholder="Any special notes..." value={form.notes} onChange={e => { set('notes', e.target.value); }} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>Cancel</button>
          <button className="btn btn-gold" onClick={() => { mutation.mutate(form); }} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};
