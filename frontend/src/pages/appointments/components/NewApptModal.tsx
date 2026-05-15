import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { AppointmentType } from '../types';
import { TODAY, HOURS } from '../constants';

export const NewApptModal: React.FC<{ onClose: () => void; defaultDate?: string }> = ({ onClose, defaultDate }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ customer: '', phone: '', type: 'Fitting' as AppointmentType, date: defaultDate ?? TODAY, time: '10:00', duration: 30, assignedTo: 'James Miller', notes: '' });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiClient.post('/appointments', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    }
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>📅 New Appointment</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group" style={{ gridColumn: '1/-1' }}>
              <label className="input-label">Customer Name</label>
              <input className="input" placeholder="John Smith" value={form.customer} onChange={e => set('customer', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Phone</label>
              <input className="input" placeholder="(555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value as AppointmentType)}>
                {(['Fitting','Pickup','Return','Consultation','Alteration'] as AppointmentType[]).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <select className="input" value={form.time} onChange={e => set('time', e.target.value)}>
                {HOURS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Duration (min)</label>
              <select className="input" value={form.duration} onChange={e => set('duration', Number(e.target.value))}>
                {[15,20,30,45,60,90].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1/-1' }}>
              <label className="input-label">Assigned Staff</label>
              <select className="input" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
                <option>James Miller</option>
                <option>Sarah Connor</option>
                <option>Tony Russo</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1/-1' }}>
              <label className="input-label">Notes</label>
              <textarea className="input" rows={2} style={{ resize: 'vertical' }} placeholder="Any special notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>Cancel</button>
          <button className="btn btn-gold" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};
