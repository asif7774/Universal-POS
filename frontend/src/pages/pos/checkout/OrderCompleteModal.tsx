import { Modal } from 'components/atoms/modal/Modal';
import { CartItem } from 'types/pos';
import { StoreSettings } from 'types/settings';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { ProductImage } from 'components/atoms/ProductImage';

interface OrderCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  cart: CartItem[];
  total: number;
  paymentMethod: string;
  change: number;
  onPrintReceipt: () => void;
  customer: { id: string; firstName: string; lastName: string } | null;
  settings: StoreSettings | null;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const OrderCompleteModal = ({
  isOpen, onClose, orderId, cart, total, paymentMethod, change, onPrintReceipt, customer, settings,
}: OrderCompleteModalProps) => {
  const firstItem = cart[0];
  const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Walk-in Customer';
  const storeAddress = settings
    ? [settings.address, settings.city, settings.state, settings.zip].filter(Boolean).join(', ')
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={680} title="">
      <div className="grid gap-0 -mx-6 -my-5 min-h-[360px]" style={{ gridTemplateColumns: '1fr 240px' }}>

        {/* ── Left / Main ── */}
        <div className="p-6 flex flex-col gap-0">

          {/* Product image + details row */}
          <div className="flex gap-5 items-start mb-5">
            {/* Image */}
            <div className="shrink-0">
              <ProductImage
                imageUrl={firstItem?.product.imageUrl}
                category={firstItem?.product.category}
                name={firstItem?.product.name}
                size="lg"
              />
            </div>

            {/* Order info */}
            <div className="flex-1">
              {/* PAID badge + Order ID */}
              <div className="flex items-center gap-[10px] mb-[10px]">
                <span className="badge badge-success text-[.7rem] font-black tracking-[.04em]">
                  PAID
                </span>
                <span className="text-[.85rem] text-[var(--text-secondary)] font-semibold">
                  Order ID: <strong className="text-[var(--text-primary)]">{orderId}</strong>
                </span>
              </div>

              {/* Customer name */}
              <div className="flex items-center gap-2 mb-[6px]">
                <span className="font-[family-name:'Playfair_Display',serif] text-[1.1rem] font-bold">
                  {customerName}
                </span>
                {customer && (
                  <span className="bg-[var(--sidebar-bg)] text-[var(--text-inverse)] text-[.65rem] font-bold px-2 py-[2px] rounded tracking-[.04em]">
                    CUSTOMER
                  </span>
                )}
              </div>

              {/* Total */}
              <div className="text-2xl font-black text-[var(--accent-gold-text)] mb-[6px]">
                {fmt(total)} <span className="text-[.75rem] font-normal text-[var(--text-muted)]">(Incl. Tax)</span>
              </div>

              {/* Items summary */}
              <div className="flex items-center gap-[6px] mb-1 text-[var(--text-secondary)] text-[.82rem]">
                <SvgIcon name="inventory" width="14" height="14" />
                {cart.length === 1
                  ? firstItem.product.name
                  : `${cart.length} items`
                }
              </div>

              {/* Paid by */}
              <div className="text-[.8rem] text-[var(--text-muted)] capitalize">
                Paid by <strong>{paymentMethod}</strong>
                {paymentMethod === 'cash' && change > 0 && (
                  <span className="ml-2 text-[var(--status-success)]">· Change: {fmt(change)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border-subtle)] mb-4" />

          {/* Items list */}
          <div className="flex flex-col gap-2 mb-5 flex-1">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-[.83rem]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.product.name}</span>
                  <span className="text-[var(--text-muted)] ml-[6px]">× {item.qty}</span>
                  {item.isRental && item.days && (
                    <span className="text-[var(--accent-gold-text)] text-[.75rem] ml-[6px]">{item.days}d rental</span>
                  )}
                </div>
                <span className="font-bold text-[var(--accent-gold-text)]">{fmt(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          {/* Print receipt button — styled like "Add Another Member" */}
          <button
            onClick={onPrintReceipt}
            className="btn btn-outline w-full mb-3 flex items-center justify-center gap-2"
          >
            <SvgIcon name="printer" width="16" height="16" />
            Print Receipt
          </button>

          {/* Customer contact row */}
          {settings && (
            <div className="flex gap-8 mt-1">
              {settings.email && (
                <div>
                  <div className="text-[.65rem] font-bold text-[var(--text-muted)] tracking-[.06em] mb-[2px]">EMAIL</div>
                  <div className="text-[.8rem] font-semibold">{settings.email}</div>
                </div>
              )}
              {settings.phone && (
                <div>
                  <div className="text-[.65rem] font-bold text-[var(--text-muted)] tracking-[.06em] mb-[2px]">PHONE</div>
                  <div className="text-[.8rem] font-semibold">{settings.phone}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right / Status card ── */}
        <div className="bg-[var(--bg-panel-hover)] border-l border-[var(--border-subtle)] rounded-[0_var(--radius-lg)_var(--radius-lg)_0] px-5 py-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="text-[.65rem] font-black text-[var(--text-muted)] tracking-[.08em]">ORDER STATUS</span>
            <div className="w-6 h-6 rounded-full bg-[var(--status-success-subtle)] flex items-center justify-center">
              <SvgIcon name="check-circle" width="14" height="14" className="text-[var(--status-success)]" />
            </div>
          </div>

          <div className="text-base font-black text-[var(--text-primary)] leading-[1.3]">
            Order successfully placed
          </div>

          {/* Store info */}
          {settings && (
            <div className="flex flex-col gap-[10px] text-[.8rem]">
              <div>
                <div className="text-[.65rem] text-[var(--text-muted)] font-semibold mb-[1px]">Store:</div>
                <div className="font-bold">{settings.name || 'TuxedoPOS'}</div>
              </div>
              {storeAddress && (
                <div>
                  <div className="text-[.65rem] text-[var(--text-muted)] font-semibold mb-[1px]">Location:</div>
                  <div className="font-semibold text-[var(--text-secondary)]">{storeAddress}</div>
                </div>
              )}
              {settings.phone && (
                <div>
                  <div className="text-[.65rem] text-[var(--text-muted)] font-semibold mb-[1px]">Phone:</div>
                  <div className="font-bold">{settings.phone}</div>
                </div>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* New Order button */}
          <button
            onClick={onClose}
            className="btn btn-gold w-full text-[.82rem]"
          >
            + New Order
          </button>

          {/* Cancel / refund link */}
          <button className="btn btn-danger w-full text-[.75rem] tracking-[.04em]">
            CANCEL ORDER &amp; REFUND
          </button>
        </div>
      </div>
    </Modal>
  );
};
