import { memo } from 'react';
import { InventoryItem } from 'types/inventory';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { SizeCell } from './SizeCell';

interface InventoryCardProps {
  item: InventoryItem;
  onClick: () => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const InventoryCard = memo(({ item, onClick }: InventoryCardProps) => {
  const totalAvail = Object.values(item.sizes).reduce((s, v) => s + v.available, 0);
  const totalAll = Object.values(item.sizes).reduce((s, v) => s + v.total, 0);
  const hasLow = Object.values(item.sizes).some(s => s.available <= item.lowStockThreshold && s.available > 0);
  const hasOut = Object.values(item.sizes).some(s => s.available === 0);

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 42, height: 42, background: 'var(--surface-hover)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--tux-navy)' }}>
            <SvgIcon name={item.category === 'Tuxedos' ? 'tuxedo' : item.category === 'Shoes' ? 'shoe' : item.category === 'Accessories' ? 'accessory' : 'inventory'} width="22" height="22" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{item.name}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
              {item.sku} · {item.location} · {item.condition}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {hasLow && (
            <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <SvgIcon name="warning" width="12" height="12" /> Low Stock
            </span>
          )}
          {hasOut && (
            <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <SvgIcon name="warning" width="12" height="12" /> Out of Stock
            </span>
          )}
          <span className={`badge ${item.type === 'rental' ? 'badge-gold' : 'badge-navy'}`}>
            {item.type === 'rental' ? `Rental ${fmt(item.rentalRate ?? 0)}/day` : `Sale ${fmt(item.salePrice ?? 0)}`}
          </span>
        </div>
      </div>

      {/* Size grid */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(item.sizes).map(([size, data]) => (
          <div key={size} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600 }}>{size}</div>
            <SizeCell data={data} lowThreshold={item.lowStockThreshold} />
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 6 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Total Available</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--tux-navy)' }}>{totalAvail} / {totalAll}</div>
          </div>
        </div>
      </div>
    </div>
  );
});
