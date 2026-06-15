import { memo } from 'react';
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
    <aside className="w-[320px] shrink-0 flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-panel)] h-full overflow-hidden">
      {/* Cart header */}
      <div className="panel-header">
        <h2 className="panel-title flex items-center gap-2">
          <SvgIcon name="pos" width="18" height="18" />
          Cart
          {cart.length > 0 && <span className="badge badge-gold ml-1.5">{cart.length}</span>}
        </h2>
        {cart.length > 0 && (
          <button className="btn btn-ghost btn-sm text-[var(--status-error)] text-[0.75rem]" onClick={() => { setCart([]); }}>
            Clear all
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-[8px_12px]">
        {cart.length === 0 ? (
          <div className="empty-state py-10 px-4">
            <div className="mb-3 flex justify-center">
              <SvgIcon name="pos" width="48" height="48" className="opacity-10" />
            </div>
            <p className="text-[0.85rem]">Click a product to add it to the cart</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cart.map((item, idx) => (
              <div key={`${item.product.id}-${item.isRental}`}
                className={`p-[10px_12px] bg-[var(--bg-panel-hover)] rounded-md border ${item.isRental ? 'border-[var(--accent-gold)]' : 'border-[var(--border-subtle)]'}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <div className="text-[0.82rem] font-bold leading-tight text-[var(--text-primary)]">{item.product.name}</div>
                    <div className="text-[0.7rem] text-[var(--text-muted)]">{item.product.sku}</div>
                    {item.isRental && <span className="badge badge-gold mt-0.5">Rental</span>}
                  </div>
                  <span className="font-extrabold text-[0.9rem] text-[var(--accent-gold-text)] whitespace-nowrap">
                    {fmt(item.lineTotal)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Qty controls */}
                  <div className="flex items-center bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
                    <button onClick={() => { updateQty(idx, -1); }} className="w-7 h-7 border-none bg-none cursor-pointer font-bold text-base text-[var(--text-secondary)]">−</button>
                    <span className="min-w-[24px] text-center text-[0.85rem] font-bold text-[var(--text-primary)]">{item.qty}</span>
                    <button onClick={() => { updateQty(idx, 1); }} className="w-7 h-7 border-none bg-none cursor-pointer font-bold text-base text-[var(--text-secondary)]">+</button>
                  </div>

                  {/* Days for rental */}
                  {item.isRental && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.75rem] text-[var(--text-muted)]">Days:</span>
                      <div className="flex items-center bg-[var(--bg-panel)] rounded-lg border border-[var(--accent-gold)] overflow-hidden">
                        <button onClick={() => { updateDays(idx, (item.days ?? 1) - 1); }} className="w-[26px] h-[26px] border-none bg-none cursor-pointer font-bold text-[var(--accent-gold-text)]">−</button>
                        <span className="min-w-[22px] text-center text-[0.82rem] font-bold text-[var(--accent-gold-text)]">{item.days}</span>
                        <button onClick={() => { updateDays(idx, (item.days ?? 1) + 1); }} className="w-[26px] h-[26px] border-none bg-none cursor-pointer font-bold text-[var(--accent-gold-text)]">+</button>
                      </div>
                    </div>
                  )}

                  <button onClick={() => { updateQty(idx, -item.qty); }} className="ml-auto bg-transparent border-none cursor-pointer text-[var(--status-error)] text-[0.7rem] font-semibold">
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
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-panel)]">
          {/* Discount */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[0.8rem] text-[var(--text-secondary)] flex-1">Discount %</span>
            <div className="flex gap-1">
              {[0, 5, 10, 15].map(d => (
                <button key={d} onClick={() => { setDiscount(d); }}
                  className={`px-2 py-0.5 rounded-md border-[1.5px] cursor-pointer text-[0.75rem] font-semibold transition-colors ${discount === d ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-[var(--text-inverse)]' : 'border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)]'
                    }`}
                >
                  {d}%
                </button>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-col gap-1 text-[0.82rem] text-[var(--text-secondary)] mb-3">
            <div className="flex justify-between">
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--status-success)]">
                <span>Discount ({discount}%)</span><span>-{fmt(discountAmt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Sales Tax (8.75%)</span><span>{fmt(tax)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-[1rem] text-[var(--text-primary)] pt-1.5 border-t border-[var(--border-subtle)] mt-0.5">
              <span>Total</span>
              <span className="text-xl font-black tracking-tight text-[var(--accent-gold-text)]">{fmt(total)}</span>
            </div>
          </div>

          <button
            className="btn btn-gold w-full"
            onClick={onCheckout}
          >
            Proceed to Checkout →
          </button>
        </div>
      )}
    </aside>
  );
});
