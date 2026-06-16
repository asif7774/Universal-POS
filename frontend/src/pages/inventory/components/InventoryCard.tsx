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

  const ratio    = totalAll > 0 ? totalAvail / totalAll : 0;
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
      : 'text-[var(--status-success)]';

  const icon = getCategoryIcon(item.category);

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col p-4 cursor-pointer
        bg-[var(--bg-panel)] rounded-2xl
        shadow-sm transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5 group
      `}
    >
      {/* ── Top Header Section ── */}
      <div className="flex gap-4 items-start w-full">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border bg-[var(--bg-panel-hover)] border-[var(--border-subtle)] text-[var(--accent-gold)]">
          <SvgIcon name={icon} width="24" height="24" />
        </div>

        {/* Title & Metadata */}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-[1.05rem] leading-tight text-[var(--text-primary)] line-clamp-2 mb-1">
            {item.name}
          </h3>
          
          <div className="flex items-center gap-x-1.5 gap-y-0.5 flex-wrap text-[0.8rem] text-[var(--text-muted)] font-medium mb-2.5">
            <span className="whitespace-nowrap">{item.sku}</span>
            <span className="whitespace-nowrap flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] opacity-50 shrink-0" />
              {item.location}
            </span>
            <span className="whitespace-nowrap flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] opacity-50 shrink-0" />
              {item.condition}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold border bg-[var(--accent-gold-subtle)] text-[var(--accent-gold-text)] border-[rgba(201,168,76,.3)]">
              {isRental ? `Rental ${fmt(item.rentalRate ?? 0)}/day` : `Sale ${fmt(item.salePrice ?? 0)}`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="mt-4 mb-4 h-1.5 w-full bg-[var(--bg-canvas)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── Sizes Grid ── */}
      <div className="flex gap-2 flex-wrap mt-1 mb-4">
        {Object.entries(item.sizes).map(([size, data]) => (
          <div key={size} className="text-center w-14">
            <div className="text-[0.75rem] text-[var(--text-secondary)] font-extrabold mb-1.5">{size}</div>
            <SizeCell data={data} lowThreshold={item.lowStockThreshold} />
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto text-right">
        <div className="text-[0.75rem] text-[var(--text-muted)] font-medium mb-0.5">Total Available</div>
        <div className={`text-xl font-black ${availColorClass}`}>
          {totalAvail} <span className="text-[var(--text-muted)] text-lg">/ {totalAll}</span>
        </div>
      </div>
    </div>
  );
});
