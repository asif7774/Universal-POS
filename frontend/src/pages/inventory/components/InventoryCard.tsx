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

  const barColorClass  = ratio < 0.2
    ? 'bg-status-error'
    : ratio < 0.5
      ? 'bg-[var(--accent-gold)]'
      : 'bg-[var(--accent-emerald-text)]';

  const availColorClass = totalAvail === 0
    ? 'text-status-error'
    : ratio < 0.2
      ? 'text-status-warning'
      : 'text-[var(--accent-emerald-text)]';

  const icon = getCategoryIcon(item.category);

  return (
    <div
      onClick={onClick}
      style={{ borderLeftColor: isRental ? 'var(--accent-gold)' : 'var(--border-subtle)' }}
      className="
        relative flex flex-col overflow-hidden cursor-pointer
        bg-[var(--bg-panel)] rounded-xl
        border border-[var(--border-subtle)] border-l-[3px]
        shadow-sm transition-all duration-200 ease-out
        hover:shadow-md hover:-translate-y-0.5
      "
    >
      {/* ── Header ── */}
      <div className="flex gap-3.5 items-start px-[18px] pt-[18px] pb-[14px]">

        {/* Icon block */}
        <div className={`
          w-11 h-11 rounded-lg shrink-0 flex items-center justify-center
          border
          ${isRental
            ? 'bg-[var(--accent-gold-subtle)] border-[rgba(201,168,76,.25)] text-[var(--accent-gold-text)]'
            : 'bg-[var(--bg-panel-hover)] border-[var(--border-subtle)] text-text-muted'
          }
        `}>
          <SvgIcon name={icon} width="20" height="20" />
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-[.95rem] leading-tight text-text-primary mb-1 line-clamp-2">
            {item.name}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[.7rem] font-bold tracking-[.04em] text-text-muted font-mono">
              {item.sku}
            </span>
            <span className="w-[3px] h-[3px] rounded-full bg-[var(--border-subtle)] shrink-0" />
            <span className="text-[.7rem] text-text-muted">{item.location}</span>
          </div>
        </div>
      </div>

      {/* ── Price / status badges ── */}
      <div className="flex items-center gap-1.5 flex-wrap px-[18px] pb-[14px]">
        <span className={`
          inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full
          text-[.72rem] font-bold tracking-[.03em] border
          ${isRental
            ? 'bg-[var(--accent-gold-subtle)] text-[var(--accent-gold-text)] border-[rgba(201,168,76,.3)]'
            : 'bg-[var(--bg-panel-hover)] text-text-secondary border-[var(--border-subtle)]'
          }
        `}>
          {isRental ? `${fmt(item.rentalRate ?? 0)} / day` : `${fmt(item.salePrice ?? 0)} sale`}
        </span>

        {hasLow && (
          <span className="
            px-2 py-[3px] rounded-full
            text-[.68rem] font-bold tracking-[.04em]
            bg-[rgba(251,191,36,.12)] text-status-warning border border-[rgba(251,191,36,.25)]
          ">
            LOW STOCK
          </span>
        )}
        {hasOut && !hasLow && (
          <span className="
            px-2 py-[3px] rounded-full
            text-[.68rem] font-bold tracking-[.04em]
            bg-[var(--status-error-subtle)] text-status-error border border-[rgba(220,38,38,.2)]
          ">
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="h-px mx-[18px] bg-[var(--border-subtle)]" />

      {/* ── Sizes ── */}
      <div className="px-[18px] py-3">
        <div className="text-[.6rem] font-extrabold tracking-[.1em] text-text-muted uppercase mb-2">
          Sizes
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(item.sizes).map(([size, data]) => (
            <div key={size} className="text-center">
              <div className="text-[.58rem] text-text-muted mb-[3px] font-bold tracking-[.04em]">
                {size}
              </div>
              <SizeCell data={data} lowThreshold={item.lowStockThreshold} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Availability footer ── */}
      <div className="mt-auto px-[18px] pt-3 pb-4 border-t border-[var(--border-subtle)] bg-[var(--bg-panel-hover)]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[.65rem] font-extrabold tracking-[.08em] text-text-muted uppercase">
            Available
          </span>
          <span className={`text-[.82rem] font-black tracking-tight ${availColorClass}`}>
            {totalAvail}
            <span className="font-medium text-[.7rem] text-text-muted"> / {totalAll}</span>
            <span className={`font-semibold text-[.68rem] ml-1 opacity-75 ${availColorClass}`}>
              {pct}%
            </span>
          </span>
        </div>

        {/* Progress track */}
        <div className="h-1 rounded-full bg-[var(--border-subtle)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${barColorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
});
