import React, { memo } from 'react';
import { CartItem } from 'types/pos';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface CartSidebarProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  updateQty: (idx: number, delta: number) => void;
  updateDays: (idx: number, days: number) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  subtotal: number;
  discountAmt: number;
  tax: number;
  total: number;
  onCheckout: () => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const CartSidebar = memo(({
  cart, setCart, updateQty, updateDays, discount, setDiscount,
  subtotal, discountAmt, tax, total, onCheckout
}: CartSidebarProps) => {

  return (
    <div style={{
      background: 'var(--surface-card)',
      borderLeft: '1px solid var(--surface-border)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Cart header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: '.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SvgIcon name="pos" width="18" height="18" style={{ color: 'var(--tux-navy)' }} />
          Cart {cart.length > 0 && <span className="badge badge-navy" style={{ marginLeft: 6 }}>{cart.length}</span>}
        </span>
        {cart.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setCart([])} style={{ color: 'var(--status-error)', fontSize: '.75rem' }}>
            Clear all
          </button>
        )}
      </div>

      {/* Cart items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {cart.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 16px' }}>
            <div style={{ marginBottom: 12 }}>
              <SvgIcon name="pos" width="48" height="48" style={{ opacity: 0.1 }} />
            </div>
            <p style={{ fontSize: '.85rem' }}>Click a product to add it to the cart</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cart.map((item, idx) => (
              <div key={`${item.product.id}-${item.isRental}`} style={{
                padding: '10px 12px',
                background: 'var(--surface-hover)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${item.isRental ? 'var(--tux-gold)' : 'var(--surface-border)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, lineHeight: 1.2 }}>{item.product.name}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{item.product.sku}</div>
                    {item.isRental && <span className="badge badge-gold" style={{ marginTop: 3 }}>Rental</span>}
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--tux-navy)', whiteSpace: 'nowrap' }}>
                    {fmt(item.lineTotal)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface-card)', borderRadius: 8, border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
                    <button onClick={() => updateQty(idx, -1)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontSize: '.85rem', fontWeight: 700 }}>{item.qty}</span>
                    <button onClick={() => updateQty(idx, 1)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>+</button>
                  </div>

                  {/* Days for rental */}
                  {item.isRental && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Days:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface-card)', borderRadius: 8, border: '1px solid var(--tux-gold)', overflow: 'hidden' }}>
                        <button onClick={() => updateDays(idx, (item.days ?? 1) - 1)} style={{ width: 26, height: 26, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--tux-gold-dark)' }}>−</button>
                        <span style={{ minWidth: 22, textAlign: 'center', fontSize: '.82rem', fontWeight: 700, color: 'var(--tux-gold-dark)' }}>{item.days}</span>
                        <button onClick={() => updateDays(idx, (item.days ?? 1) + 1)} style={{ width: 26, height: 26, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--tux-gold-dark)' }}>+</button>
                      </div>
                    </div>
                  )}

                  <button onClick={() => updateQty(idx, -item.qty)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-error)', fontSize: '.7rem', fontWeight: 600 }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals + checkout */}
      {cart.length > 0 && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--surface-border)', background: 'var(--surface-card)' }}>
          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)', flex: 1 }}>Discount %</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 5, 10, 15].map(d => (
                <button key={d} onClick={() => setDiscount(d)}
                  style={{
                    padding: '3px 8px', borderRadius: 6, border: '1.5px solid',
                    borderColor: discount === d ? 'var(--tux-navy)' : 'var(--surface-border)',
                    background: discount === d ? 'var(--tux-navy)' : 'transparent',
                    color: discount === d ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: '.75rem', fontWeight: 600,
                  }}>
                  {d}%
                </button>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-success)' }}>
                <span>Discount ({discount}%)</span><span>-{fmt(discountAmt)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sales Tax (8.75%)</span><span>{fmt(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', paddingTop: 6, borderTop: '1px solid var(--surface-border)', marginTop: 2 }}>
              <span>Total</span><span style={{ color: 'var(--tux-navy)' }}>{fmt(total)}</span>
            </div>
          </div>

          <button
            className="btn btn-gold"
            style={{ width: '100%', fontSize: '.95rem', padding: '12px' }}
            onClick={onCheckout}
          >
            Proceed to Checkout →
          </button>
        </div>
      )}
    </div>
  );
});
