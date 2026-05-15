import React from 'react';
import { InventoryItem } from 'types/inventory';
import { SizeCell } from './SizeCell';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface InventoryDetailModalProps {
  selected: InventoryItem | null;
  setSelected: (item: InventoryItem | null) => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({ selected, setSelected }) => {
  if (!selected) {return null;}

  return (
    <Modal
      isOpen={!!selected}
      onClose={() => { setSelected(null); }}
      title={selected.name}
      maxWidth={520}
      footer={
        <>
          <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SvgIcon name="tailoring" width="14" height="14" /> Edit
          </button>
          <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SvgIcon name="inventory" width="14" height="14" /> Adjust Stock
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); }}>Close</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'SKU', value: selected.sku },
            { label: 'Category', value: selected.category },
            { label: 'Type', value: selected.type === 'rental' ? `Rental — ${fmt(selected.rentalRate ?? 0)}/day` : `Sale — ${fmt(selected.salePrice ?? 0)}` },
            { label: 'Condition', value: selected.condition },
            { label: 'Location', value: selected.location },
            { label: 'Low Stock Alert', value: `≤ ${selected.lowStockThreshold} units` },
          ].map(i => (
            <div key={i.label} style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>{i.label}</div>
              <div style={{ fontSize: '.875rem', fontWeight: 700 }}>{i.value}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>SIZE AVAILABILITY</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(selected.sizes).map(([size, data]) => (
              <div key={size} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{size}</div>
                <SizeCell data={data} lowThreshold={selected.lowStockThreshold} />
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, fontSize: '.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} />Available / Total</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--tux-navy)' }} />Out on rental</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#7C3AED' }} />In cleaning</div>
        </div>
      </div>
    </Modal>
  );
};
