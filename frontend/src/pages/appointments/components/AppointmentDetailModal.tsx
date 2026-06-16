import React from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { Appointment } from 'types/appointments';
import { TYPE_CONFIG, STATUS_CONFIG, fmtDay } from 'constants/appointments';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface AppointmentDetailModalProps {
  selected: Appointment | null;
  setSelected: (a: Appointment | null) => void;
  updateMutation: UseMutationResult<any, Error, { id: string; status: string }>;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ selected, setSelected, updateMutation }) => {
  if (!selected) {return null;}

  const typeCfg = TYPE_CONFIG[selected.type] ?? TYPE_CONFIG['Consultation'];
  const statusCfg = STATUS_CONFIG[selected.status] ?? { cls: 'badge-gray', dot: '#94A3B8' };

  return (
    <div className="modal-overlay" onClick={() => { setSelected(null); }}>
      <div className="modal animate-slide-up max-w-[460px]" onClick={e => { e.stopPropagation(); }}>
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: typeCfg.color, opacity: 0.8 }}>
                <SvgIcon name={typeCfg.icon} width="20" height="20" />
              </span>
              <h3 className="font-['Playfair_Display',serif] text-[1.1rem]">{selected.type} — {selected.customer}</h3>
            </div>
            <span className={`badge ${statusCfg.cls}`}>{selected.status}</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => { setSelected(null); }}>
            <SvgIcon name="close" width="16" height="16" />
          </button>
        </div>
        <div className="modal-body flex flex-col gap-[14px]">
          <div className="grid grid-cols-2 gap-[10px]">
            {[
              { label: 'Date', value: `${fmtDay(selected.date).weekday}, ${fmtDay(selected.date).month} ${fmtDay(selected.date).day}` },
              { label: 'Time', value: `${selected.time} (${selected.duration} min)` },
              { label: 'Phone', value: selected.phone },
              { label: 'Assigned To', value: selected.assignedTo },
              ...(selected.orderId ? [{ label: 'Linked Order', value: selected.orderId }] : []),
            ].map(i => (
              <div key={i.label} className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] px-[10px] py-2">
                <div className="text-[.7rem] text-[var(--text-muted)] font-semibold mb-[3px]">{i.label}</div>
                <div className="text-[.875rem] font-bold">{i.value}</div>
              </div>
            ))}
          </div>
          {selected.notes && (
            <div className="px-3 py-[10px] bg-[#FFFBEB] border border-[#FDE68A] rounded-[var(--radius-sm)] text-[.85rem] text-[#92400E] flex gap-2">
              <SvgIcon name="tailoring" width="14" height="14" className="mt-0.5" />
              {selected.notes}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {selected.status === 'Scheduled' && (
            <button className="btn btn-gold" onClick={() => { updateMutation.mutate({ id: selected.id, status: 'Confirmed' }); }}>
              <SvgIcon name="check-circle" width="16" height="16" /> Confirm
            </button>
          )}
          {selected.status === 'Confirmed' && (
            <button className="btn btn-gold" onClick={() => { updateMutation.mutate({ id: selected.id, status: 'Completed' }); }}>
              <SvgIcon name="check-circle" width="16" height="16" /> Mark Complete
            </button>
          )}
          {!['Cancelled','Completed','No-Show'].includes(selected.status) && <button className="btn btn-danger btn-sm" onClick={() => { updateMutation.mutate({ id: selected.id, status: 'Cancelled' }); }}>Cancel</button>}
          <button className="btn btn-outline" onClick={() => { setSelected(null); }}>Close</button>
        </div>
      </div>
    </div>
  );
};
