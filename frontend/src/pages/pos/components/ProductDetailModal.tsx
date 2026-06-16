import React, { useState } from 'react';
import { Product } from 'types/pos';
import { Modal } from 'components/atoms/modal/Modal';
import { ProductImage } from 'components/atoms/ProductImage';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, isRental: boolean) => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const [rentalDays, setRentalDays] = useState(1);

  if (!product) { return null; }

  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock < 5;
  const canRent = product.type === 'rental' || product.rentalRate != null;
  const canSell = product.price > 0;

  const handleAdd = (isRental: boolean) => {
    onAddToCart(product, isRental);
    onClose();
  };

  return (
    <Modal
      isOpen={!!product}
      onClose={onClose}
      maxWidth={560}
      title={product.name}
      footer={
        <>
          {canSell && !outOfStock && (
            <button
              className="btn btn-gold inline-flex items-center gap-1.5"
              onClick={() => { handleAdd(false); }}
            >
              <SvgIcon name="pos" width="14" height="14" />
              Add to Cart — {fmt(product.price)}
            </button>
          )}
          {canRent && !outOfStock && (
            <button
              className="btn btn-gold inline-flex items-center gap-1.5"
              onClick={() => { handleAdd(true); }}
            >
              <SvgIcon name="rental" width="14" height="14" />
              Rent — {fmt((product.rentalRate ?? 0) * rentalDays)}/{rentalDays}d
            </button>
          )}
          {outOfStock && (
            <span className="text-[.85rem] text-[var(--status-error)] font-semibold">Out of stock</span>
          )}
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </>
      }
    >
      <div className="flex gap-5">
        {/* Image */}
        <ProductImage
          imageUrl={product.imageUrl}
          category={product.category}
          name={product.name}
          size="lg"
        />

        {/* Details */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex gap-1.5 flex-wrap">
            <span className="badge badge-navy">{product.category}</span>
            {product.type === 'rental'
              ? <span className="badge badge-gold">Rental</span>
              : <span className="badge badge-gray">Sale</span>
            }
          </div>

          <div className="text-[.8rem] text-[var(--text-muted)]">SKU: <strong>{product.sku}</strong></div>

          <div className="grid grid-cols-2 gap-2.5">
            {canSell && (
              <div className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] px-3 py-2.5">
                <div className="text-[.7rem] text-[var(--text-muted)] font-semibold mb-[3px]">SALE PRICE</div>
                <div className="text-[1.1rem] font-extrabold text-[var(--accent-gold-text)]">{fmt(product.price)}</div>
              </div>
            )}
            {canRent && (
              <div className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] px-3 py-2.5">
                <div className="text-[.7rem] text-[var(--text-muted)] font-semibold mb-[3px]">RENTAL RATE</div>
                <div className="text-[1.1rem] font-extrabold text-[var(--accent-gold-text)]">{fmt(product.rentalRate ?? 0)}<span className="text-[.7rem] font-normal">/day</span></div>
              </div>
            )}
            <div className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-sm)] px-3 py-2.5">
              <div className="text-[.7rem] text-[var(--text-muted)] font-semibold mb-[3px]">IN STOCK</div>
              <div
                className="text-[1.1rem] font-extrabold"
                style={{ color: outOfStock ? 'var(--status-error)' : lowStock ? 'var(--status-warning)' : 'var(--status-success)' }}
              >
                {product.stock} {outOfStock ? '— unavailable' : lowStock ? '— low' : ''}
              </div>
            </div>
          </div>

          {canRent && (
            <div className="input-group">
              <label className="input-label">Rental Duration (days)</label>
              <div className="flex items-center gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => { setRentalDays(d => Math.max(1, d - 1)); }}>−</button>
                <span className="min-w-8 text-center font-bold">{rentalDays}</span>
                <button className="btn btn-outline btn-sm" onClick={() => { setRentalDays(d => d + 1); }}>+</button>
                <span className="text-[.8rem] text-[var(--text-muted)]">
                  = {fmt((product.rentalRate ?? 0) * rentalDays)} total
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
