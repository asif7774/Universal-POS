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
      <div style={{ flex: 1 }}>
        <div className="text-[var(--text-primary)] font-semibold text-[0.95rem]">{r.customerName}</div>
        <div className="text-[var(--text-muted)] text-xs">
          Measured {fmtDate(r.date)} by {r.takenBy}
        </div>
      </div>
      <span className="badge badge-neutral">{r.jacketSize}</span>
    </div>

    {/* Quick size grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
      {[
        { l: 'Chest', v: r.chest }, { l: 'Waist', v: r.waist },
        { l: 'Sleeve', v: r.sleeve }, { l: 'Inseam', v: r.inseam },
      ].map(s => (
        <div key={s.l} style={{ textAlign: 'center', padding: '6px 4px', background: 'var(--bg-panel-hover)', borderRadius: 8 }}>
          <div className="text-sm font-bold text-[var(--text-primary)]">{s.v}</div>
          <div className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wide">{s.l}</div>
        </div>
      ))}
    </div>

    {r.notes && (
      <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, lineHeight: 1.4, display: 'flex', gap: 6 }}>
        <SvgIcon name="tailoring" width="14" height="14" style={{ marginTop: 2 }} /> {r.notes}
      </div>
    )}
  </div>
));
