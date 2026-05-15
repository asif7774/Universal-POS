import React from 'react';
import { Customer, Measurement } from 'types/customers';

interface CustomerDetailModalProps {
  selected: Customer | null;
  setSelected: (c: Customer | null) => void;
  activeTab: 'profile' | 'measurements' | 'history';
  setActiveTab: (tab: 'profile' | 'measurements' | 'history') => void;
  measurements?: Measurement[];
}

const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;
const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';

const MeasurementRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--surface-border)', fontSize: '.85rem' }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontWeight: 700 }}>{value || '-'}</span>
  </div>
);

export const CustomerDetailModal = ({ selected, setSelected, activeTab, setActiveTab, measurements }: CustomerDetailModalProps) => {
  if (!selected) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelected(null)}>
      <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="avatar" style={{ width: 48, height: 48, fontSize: '1rem', background: selected.tags?.includes('VIP') ? 'var(--tux-gold)' : 'var(--tux-navy)', color: selected.tags?.includes('VIP') ? 'var(--tux-navy-dark)' : 'white' }}>
              {selected.firstName[0]}{selected.lastName[0]}
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem' }}>{selected.firstName} {selected.lastName}</h3>
              <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                {selected.email} · {selected.phone}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)' }}>
          {(['profile', 'measurements', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '10px', border: 'none', background: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '.82rem',
                textTransform: 'capitalize', letterSpacing: '.02em',
                color: activeTab === tab ? 'var(--tux-navy)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--tux-navy)' : '2px solid transparent',
                transition: 'all .15s',
              }}>
              {tab === 'measurements' ? '📐 ' : tab === 'history' ? '📋 ' : '👤 '}{tab}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Member Since', value: fmtDate(selected.createdAt) },
                  { label: 'Last Visit', value: fmtDate(selected.lastVisitAt) },
                  { label: 'Total Orders', value: selected.totalOrders },
                  { label: 'Total Spent', value: fmt(selected.totalSpent) },
                  { label: 'Loyalty Points', value: `${selected.loyaltyPoints} pts` },
                  { label: 'Value as Credit', value: fmt(selected.loyaltyPoints * 0.01) },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: '.95rem', fontWeight: 700 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {selected.tags && selected.tags.length > 0 && (
                <div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>TAGS</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selected.tags.map(tag => (
                      <span key={tag} className={`badge ${tag === 'VIP' ? 'badge-gold' : tag === 'Overdue' ? 'badge-red' : tag === 'Corporate' ? 'badge-navy' : 'badge-gray'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.notes && (
                <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', fontSize: '.85rem', color: '#92400E' }}>
                  ⚠️ {selected.notes}
                </div>
              )}
            </div>
          )}

          {activeTab === 'measurements' && (
            measurements && measurements.length > 0 ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  <div>
                    <MeasurementRow label="Jacket Size" value={measurements[0].jacketSize} />
                    <MeasurementRow label="Chest" value={measurements[0].chest} />
                    <MeasurementRow label="Waist" value={measurements[0].waist} />
                    <MeasurementRow label="Hips" value={measurements[0].hips} />
                    <MeasurementRow label="Shoulder" value={measurements[0].shoulder} />
                  </div>
                  <div>
                    <MeasurementRow label="Neck" value={measurements[0].neck} />
                    <MeasurementRow label="Sleeve" value={measurements[0].sleeve} />
                    <MeasurementRow label="Inseam" value={measurements[0].inseam} />
                    <MeasurementRow label="Outseam" value={measurements[0].outseam} />
                    <MeasurementRow label="Shoe Size" value={measurements[0].shoeSize} />
                  </div>
                </div>
                {measurements[0].notes && (
                  <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                    📝 {measurements[0].notes}
                  </div>
                )}
                <button className="btn btn-outline" style={{ marginTop: 16, width: '100%' }}>
                  ✏️ Edit Measurements
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📐</div>
                <p>No measurements on file</p>
                <button className="btn btn-gold" style={{ marginTop: 12 }}>Add Measurements</button>
              </div>
            )
          )}

          {activeTab === 'history' && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p style={{ marginBottom: 4 }}>{selected.totalOrders} orders total</p>
              <p style={{ fontSize: '.8rem' }}>Full order history coming with API integration</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline">Edit Customer</button>
          <button className="btn btn-gold">+ New Rental</button>
        </div>
      </div>
    </div>
  );
};
