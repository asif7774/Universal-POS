import React, { memo } from 'react';
import { MeasurementRecord } from 'types/measurements';
import { fmtDate } from 'constants/measurements';

interface MeasurementCardProps {
  r: MeasurementRecord;
  onClick: (r: MeasurementRecord) => void;
}

export const MeasurementCard = memo(({ r, onClick }: MeasurementCardProps) => (
  <div className="card" style={{ cursor: 'pointer' }} onClick={() => onClick(r)}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
      <div className="avatar" style={{ background: 'var(--tux-navy)', flexShrink: 0 }}>
        {r.customerName.split(' ').map(n => n[0]).join('')}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{r.customerName}</div>
        <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
          Measured {fmtDate(r.date)} by {r.takenBy}
        </div>
      </div>
      <span className="badge badge-navy">{r.jacketSize}</span>
    </div>

    {/* Quick size grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
      {[
        { l: 'Chest', v: r.chest }, { l: 'Waist', v: r.waist },
        { l: 'Sleeve', v: r.sleeve }, { l: 'Inseam', v: r.inseam },
      ].map(s => (
        <div key={s.l} style={{ textAlign: 'center', padding: '6px 4px', background: 'var(--surface-hover)', borderRadius: 8 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{s.v}</div>
          <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div>
        </div>
      ))}
    </div>

    {r.notes && (
      <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--surface-border)', paddingTop: 10, lineHeight: 1.4 }}>
        📝 {r.notes}
      </div>
    )}
  </div>
));
