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
              className="btn btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={() => { handleAdd(false); }}
            >
              <SvgIcon name="pos" width="14" height="14" />
              Add to Cart — {fmt(product.price)}
            </button>
          )}
          {canRent && !outOfStock && (
            <button
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={() => { handleAdd(true); }}
            >
              <SvgIcon name="rental" width="14" height="14" />
              Rent — {fmt((product.rentalRate ?? 0) * rentalDays)}/{rentalDays}d
            </button>
          )}
          {outOfStock && (
            <span style={{ fontSize: '.85rem', color: 'var(--status-error)', fontWeight: 600 }}>Out of stock</span>
          )}
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Image */}
        <ProductImage
          imageUrl={product.imageUrl}
          category={product.category}
          name={product.name}
          size="lg"
        />

        {/* Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-navy">{product.category}</span>
            {product.type === 'rental'
              ? <span className="badge badge-gold">Rental</span>
              : <span className="badge badge-gray">Sale</span>
            }
          </div>

          <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>SKU: <strong>{product.sku}</strong></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {canSell && (
              <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>SALE PRICE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{fmt(product.price)}</div>
              </div>
            )}
            {canRent && (
              <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>RENTAL RATE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--tux-gold)' }}>{fmt(product.rentalRate ?? 0)}<span style={{ fontSize: '.7rem', fontWeight: 400 }}>/day</span></div>
              </div>
            )}
            <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>IN STOCK</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: outOfStock ? 'var(--status-error)' : lowStock ? 'var(--status-warning)' : 'var(--status-success)' }}>
                {product.stock} {outOfStock ? '— unavailable' : lowStock ? '— low' : ''}
              </div>
            </div>
          </div>

          {canRent && (
            <div className="input-group">
              <label className="input-label">Rental Duration (days)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setRentalDays(d => Math.max(1, d - 1)); }}>−</button>
                <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{rentalDays}</span>
                <button className="btn btn-outline btn-sm" onClick={() => { setRentalDays(d => d + 1); }}>+</button>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
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
