import { memo } from 'react';
import { MeasurementRecord } from 'types/measurements';
import { fmtDate } from 'constants/measurements';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface MeasurementCardProps {
  r: MeasurementRecord;
  onClick: (r: MeasurementRecord) => void;
}

export const MeasurementCard = memo(({ r, onClick }: MeasurementCardProps) => (
  <div
    className="panel p-4 hover:bg-[var(--bg-panel-hover)] cursor-pointer transition-all"
    onClick={() => { onClick(r); }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
  >
    <div className="flex gap-3 items-start mb-3.5">
      <div className="w-10 h-10 rounded-full bg-[var(--accent-gold-subtle)] text-[var(--accent-gold-text)] font-black text-sm flex items-center justify-center shrink-0">
        {r.customerName.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1">
        <div className="text-[var(--text-primary)] font-semibold text-[0.95rem]">{r.customerName}</div>
        <div className="text-[var(--text-muted)] text-xs">
          Measured {fmtDate(r.date)} by {r.takenBy}
        </div>
      </div>
      <span className="badge badge-neutral">{r.jacketSize}</span>
    </div>

    {/* Quick size grid */}
    <div className="grid grid-cols-4 gap-2 mb-2.5">
      {[
        { l: 'Chest', v: r.chest }, { l: 'Waist', v: r.waist },
        { l: 'Sleeve', v: r.sleeve }, { l: 'Inseam', v: r.inseam },
      ].map(s => (
        <div key={s.l} className="text-center py-1.5 px-1 bg-[var(--bg-panel-hover)] rounded-lg">
          <div className="text-sm font-bold text-[var(--text-primary)]">{s.v}</div>
          <div className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wide">{s.l}</div>
        </div>
      ))}
    </div>

    {r.notes && (
      <div className="text-[.78rem] text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-2.5 leading-[1.4] flex gap-1.5">
        <SvgIcon name="tailoring" width="14" height="14" className="mt-0.5" /> {r.notes}
      </div>
    )}
  </div>
));
