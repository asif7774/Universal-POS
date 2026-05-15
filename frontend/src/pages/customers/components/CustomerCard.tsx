import React, { memo } from 'react';
import { Customer } from '../types';

interface CustomerCardProps {
  c: Customer;
  onClick: () => void;
}

const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;

export const CustomerCard = memo(({ c, onClick }: CustomerCardProps) => (
  <div className="card" style={{ cursor: 'pointer', transition: 'all .15s' }}
    onClick={onClick}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
  >
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div className="avatar" style={{ width: 44, height: 44, fontSize: '.9rem', flexShrink: 0, background: c.tags?.includes('VIP') ? 'var(--tux-gold)' : 'var(--tux-navy)', color: c.tags?.includes('VIP') ? 'var(--tux-navy-dark)' : 'white' }}>
        {c.firstName[0]}{c.lastName[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{c.firstName} {c.lastName}</span>
          {c.tags?.includes('VIP') && <span className="badge badge-gold">VIP</span>}
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: 1 }}>{c.email}</div>
        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{c.phone}</div>
      </div>
    </div>

    <div className="divider" />

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
      {[
        { label: 'Orders', value: c.totalOrders },
        { label: 'Spent', value: fmt(c.totalSpent) },
        { label: 'Points', value: c.loyaltyPoints },
      ].map(s => (
        <div key={s.label}>
          <div style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{s.value}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
        </div>
      ))}
    </div>

    {c.tags && c.tags.length > 0 && (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
        {c.tags.filter(t => t !== 'VIP').map(tag => (
          <span key={tag} className={`badge ${tag === 'Overdue' ? 'badge-red' : tag === 'Corporate' ? 'badge-navy' : 'badge-gray'}`}>
            {tag}
          </span>
        ))}
      </div>
    )}

    {c.notes && (
      <div style={{ marginTop: 8, fontSize: '.75rem', color: 'var(--status-warning)', borderTop: '1px solid var(--surface-border)', paddingTop: 8 }}>
        ⚠️ {c.notes}
      </div>
    )}
  </div>
));
