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

  const ratio = totalAll > 0 ? totalAvail / totalAll : 0;
  const fillClass = ratio < 0.3 ? 'progress-fill-error' : ratio < 0.6 ? 'progress-fill-gold' : 'progress-fill-emerald';

  return (
    <div className="panel hover:bg-[var(--bg-panel-hover)] transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-3.5">
        <div className="flex gap-3 items-center">
          <div className="w-[42px] h-[42px] bg-[var(--bg-panel-hover)] rounded-[10px] flex items-center justify-center shrink-0 text-[var(--accent-gold)]">
            <SvgIcon name={item.category === 'Tuxedos' ? 'tuxedo' : item.category === 'Shoes' ? 'shoe' : item.category === 'Accessories' ? 'accessory' : 'inventory'} width="22" height="22" />
          </div>
          <div>
            <div className="font-semibold text-[var(--text-primary)] text-[0.95rem]">{item.name}</div>
            <div className="text-[0.78rem] text-[var(--text-muted)]">
              {item.sku} · {item.location} · {item.condition}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 items-center shrink-0">
          {hasLow && (
            <span className="badge badge-warning inline-flex items-center gap-1">
              <SvgIcon name="warning" width="12" height="12" /> Low Stock
            </span>
          )}
          {hasOut && (
            <span className="badge badge-error inline-flex items-center gap-1">
              <SvgIcon name="warning" width="12" height="12" /> Out of Stock
            </span>
          )}
          <span className={`badge ${item.type === 'rental' ? 'badge-gold' : 'badge-neutral'}`}>
            {item.type === 'rental' ? `Rental ${fmt(item.rentalRate ?? 0)}/day` : `Sale ${fmt(item.salePrice ?? 0)}`}
          </span>
        </div>
      </div>

      {/* Stock progress bar */}
      <div className="progress-track mb-3">
        <div className={`progress-fill ${fillClass}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>

      {/* Size grid */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(item.sizes).map(([size, data]) => (
          <div key={size} className="text-center">
            <div className="text-[0.68rem] text-[var(--text-muted)] mb-0.5 font-semibold">{size}</div>
            <SizeCell data={data} lowThreshold={item.lowStockThreshold} />
          </div>
        ))}
        <div className="flex items-center ml-auto gap-1.5">
          <div className="text-right">
            <div className="text-[0.75rem] text-[var(--text-muted)]">Total Available</div>
            <div
              className="text-[1.2rem] font-black"
              style={{ color: totalAvail === 0 ? 'var(--status-error)' : totalAvail <= item.lowStockThreshold ? 'var(--status-warning)' : 'var(--status-success)' }}
            >
              {totalAvail} / {totalAll}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
