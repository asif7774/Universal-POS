import React, { useState } from 'react';

interface MeasurementRecord {
  id: string;
  customerId: string;
  customerName: string;
  takenBy: string;
  date: string;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
  outseam: string;
  neck: string;
  sleeve: string;
  shoulder: string;
  jacketSize: string;
  shoeSize: string;
  weight?: string;
  height?: string;
  notes: string;
  fittingNotes?: string;
}

const RECORDS: MeasurementRecord[] = [
  { id: 'm1', customerId: 'c1', customerName: 'Marcus Johnson', takenBy: 'James Miller', date: '2026-04-10', chest: '42"', waist: '36"', hips: '42"', inseam: '32"', outseam: '42"', neck: '16"', sleeve: '34"', shoulder: '19"', jacketSize: '42R', shoeSize: '10.5', weight: '185 lbs', height: '6\'1"', notes: 'Prefers slim fit. Left shoulder slightly higher by ¼".', fittingNotes: 'Wedding rental — May 15. Jacket hemmed at left shoulder.' },
  { id: 'm2', customerId: 'c2', customerName: 'David Williams', takenBy: 'Sarah Connor', date: '2026-05-01', chest: '40"', waist: '32"', hips: '40"', inseam: '30"', outseam: '40"', neck: '15"', sleeve: '32"', shoulder: '18"', jacketSize: '40R', shoeSize: '9', weight: '165 lbs', height: '5\'10"', notes: 'Regular fit. First-time rental.' },
  { id: 'm3', customerId: 'c3', customerName: 'Robert Chen', takenBy: 'James Miller', date: '2026-03-15', chest: '44"', waist: '38"', hips: '44"', inseam: '31"', outseam: '41"', neck: '17"', sleeve: '35"', shoulder: '20"', jacketSize: '44R', shoeSize: '11', weight: '210 lbs', height: '6\'2"', notes: 'Classic fit preferred. Broad shoulders.', fittingNotes: 'Jacket shoulders let out ½". Repeat customer — keep on file.' },
  { id: 'm4', customerId: 'c5', customerName: 'Kevin Park', takenBy: 'Sarah Connor', date: '2026-05-12', chest: '38"', waist: '30"', hips: '38"', inseam: '28"', outseam: '38"', neck: '14.5"', sleeve: '31"', shoulder: '17"', jacketSize: '38S', shoeSize: '8.5', notes: 'Short fit. Group booking coordinator.' },
];

const FIELDS: Array<{ key: keyof MeasurementRecord; label: string; unit?: string }> = [
  { key: 'jacketSize', label: 'Jacket Size' },
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'neck', label: 'Neck' },
  { key: 'sleeve', label: 'Sleeve' },
  { key: 'inseam', label: 'Inseam' },
  { key: 'outseam', label: 'Outseam' },
  { key: 'shoeSize', label: 'Shoe Size' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight' },
];

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// New Measurement Form
const NewMeasurementModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form, setForm] = useState<Partial<MeasurementRecord>>({});
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const inputFields = [
    { key: 'customerName', label: 'Customer Name', placeholder: 'John Smith', type: 'text' },
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>📐 New Measurement Record</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {inputFields.map(f => (
              <div key={f.key} className="input-group" style={f.key === 'customerName' ? { gridColumn: '1 / -1' } : {}}>
                <label className="input-label">{f.label}</label>
                <input
                  className="input" type={f.type} placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key] ?? ''}
                  onChange={e => set(f.key, e.target.value)}
                />
              </div>
            ))}
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Fitting Notes</label>
              <textarea
                className="input" placeholder="Any special notes about fit, alterations needed, etc."
                rows={3} style={{ resize: 'vertical' }}
                value={form.fittingNotes ?? ''}
                onChange={e => set('fittingNotes', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={onClose}>Save Measurements</button>
        </div>
      </div>
    </div>
  );
};

const Measurements: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MeasurementRecord | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = RECORDS.filter(r =>
    r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Measurements</h1>
          <p className="page-subtitle">Digital measurement book · {RECORDS.length} profiles on file</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowNew(true)}>+ Take Measurement</button>
      </div>

      <div className="input-with-icon" style={{ marginBottom: 20, maxWidth: 400 }}>
        <span className="input-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </span>
        <input className="input" placeholder="Search customer..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(r => (
          <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}
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
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📐</div>
          <p>No measurement records found</p>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{selected.customerName}</h3>
                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                  Measured {fmtDate(selected.date)} · by {selected.takenBy}
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Measurement grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                {FIELDS.filter(f => selected[f.key]).map(f => (
                  <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--surface-border)', fontSize: '.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                    <span style={{ fontWeight: 700 }}>{String(selected[f.key])}</span>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '.85rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)', fontSize: '.75rem', textTransform: 'uppercase' }}>Tailor Notes</div>
                  {selected.notes}
                </div>
              )}
              {selected.fittingNotes && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: '#FDF8E7', border: '1px solid #FDE68A', borderRadius: 'var(--radius-sm)', fontSize: '.85rem', color: '#92400E' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '.75rem', textTransform: 'uppercase' }}>Fitting Notes</div>
                  {selected.fittingNotes}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline">✏️ Edit</button>
              <button className="btn btn-primary">🖨️ Print Card</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showNew && <NewMeasurementModal onClose={() => setShowNew(false)} />}
    </div>
  );
};

export default Measurements;
