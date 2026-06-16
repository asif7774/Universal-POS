import { memo } from 'react';
import { InventoryItem } from 'types/inventory';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { SizeCell } from './SizeCell';

interface InventoryCardProps {
  item: InventoryItem;
  onClick: () => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

const getCategoryIcon = (category: string) => {
  if (!category) return 'inventory';
  const c = category.toLowerCase();
  if (c.includes('tux') || c.includes('suit')) return 'tuxedo';
  if (c.includes('shoe')) return 'shoe';
  if (c.includes('shirt')) return 'shirt';
  if (c.includes('accessor') || c.includes('tie')) return 'bowtie';
  if (c.includes('service') || c.includes('alteration') || c.includes('tailor')) return 'scissors';
  return 'inventory';
};

export const InventoryCard = memo(({ item, onClick }: InventoryCardProps) => {
  const totalAvail = Object.values(item.sizes).reduce((s, v) => s + v.available, 0);
  const totalAll   = Object.values(item.sizes).reduce((s, v) => s + v.total, 0);
  const hasOut     = Object.values(item.sizes).some(s => s.available === 0);

  const ratio    = totalAll > 0 ? totalAvail / totalAll : 0;
  const hasLow   = totalAvail > 0 && ratio < 0.2;
  const pct      = Math.round(ratio * 100);
  const isRental = item.type === 'rental';

  const barColor  = ratio < 0.2 ? 'var(--status-error)' : ratio < 0.5 ? 'var(--accent-gold)' : 'var(--accent-emerald-text)';
  const availColor = totalAvail === 0 ? 'var(--status-error)' : ratio < 0.2 ? 'var(--status-warning)' : 'var(--accent-emerald-text)';

  const icon = getCategoryIcon(item.category);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-panel)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        borderLeft: isRental ? '3px solid var(--accent-gold)' : '3px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        transition: 'box-shadow .18s ease, transform .18s ease, border-color .18s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
      className="inventory-card-root"
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = 'var(--shadow-md)';
        el.style.transform = 'translateY(-2px)';
        if (isRental) el.style.borderLeftColor = 'var(--accent-gold)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = 'var(--shadow-sm)';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '18px 18px 14px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Icon block */}
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-lg)', flexShrink: 0,
          background: isRental ? 'var(--accent-gold-subtle)' : 'var(--bg-panel-hover)',
          border: isRental ? '1px solid rgba(201,168,76,.25)' : '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isRental ? 'var(--accent-gold-text)' : 'var(--text-muted)',
        }}>
          <SvgIcon name={icon} width="20" height="20" />
        </div>

        {/* Title block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 800, fontSize: '.95rem', lineHeight: 1.25,
            color: 'var(--text-primary)', marginBottom: 4,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {item.name}
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.04em', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {item.sku}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-subtle)', flexShrink: 0 }} />
            <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{item.location}</span>
          </div>
        </div>
      </div>

      {/* ── Price / Badge strip ── */}
      <div style={{
        padding: '0 18px 14px',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 20,
          fontSize: '.72rem', fontWeight: 700, letterSpacing: '.03em',
          background: isRental ? 'var(--accent-gold-subtle)' : 'var(--bg-panel-hover)',
          color: isRental ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
          border: isRental ? '1px solid rgba(201,168,76,.3)' : '1px solid var(--border-subtle)',
        }}>
          {isRental ? `${fmt(item.rentalRate ?? 0)} / day` : `${fmt(item.salePrice ?? 0)} sale`}
        </span>

        {hasLow && (
          <span style={{
            padding: '3px 8px', borderRadius: 20,
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.04em',
            background: 'rgba(251,191,36,.12)', color: 'var(--status-warning)',
            border: '1px solid rgba(251,191,36,.25)',
          }}>
            LOW STOCK
          </span>
        )}
        {hasOut && !hasLow && (
          <span style={{
            padding: '3px 8px', borderRadius: 20,
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.04em',
            background: 'var(--status-error-subtle)', color: 'var(--status-error)',
            border: '1px solid rgba(220,38,38,.2)',
          }}>
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 18px' }} />

      {/* ── Sizes ── */}
      <div style={{ padding: '12px 18px' }}>
        <div style={{
          fontSize: '.6rem', fontWeight: 800, letterSpacing: '.1em',
          color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8,
        }}>
          Sizes
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(item.sizes).map(([size, data]) => (
            <div key={size} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.58rem', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 700, letterSpacing: '.04em' }}>
                {size}
              </div>
              <SizeCell data={data} lowThreshold={item.lowStockThreshold} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Availability bar ── */}
      <div style={{
        marginTop: 'auto', padding: '12px 18px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-panel-hover)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Available
          </span>
          <span style={{ fontSize: '.82rem', fontWeight: 900, color: availColor, letterSpacing: '-.01em' }}>
            {totalAvail}
            <span style={{ fontWeight: 500, fontSize: '.7rem', color: 'var(--text-muted)' }}> / {totalAll}</span>
            <span style={{ fontWeight: 600, fontSize: '.68rem', color: availColor, marginLeft: 4, opacity: .75 }}>
              {pct}%
            </span>
          </span>
        </div>

        {/* Track */}
        <div style={{ height: 4, borderRadius: 99, background: 'var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${pct}%`,
            background: barColor,
            transition: 'width .5s cubic-bezier(.4,0,.2,1)',
          }} />
        </div>
      </div>
    </div>
  );
});
