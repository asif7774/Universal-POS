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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 0, margin: '-20px -24px', minHeight: 360 }}>

        {/* ── Left / Main ── */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Product image + details row */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 20 }}>
            {/* Image */}
            <div style={{ flexShrink: 0 }}>
              <ProductImage
                imageUrl={firstItem?.product.imageUrl}
                category={firstItem?.product.category}
                name={firstItem?.product.name}
                size="lg"
              />
            </div>

            {/* Order info */}
            <div style={{ flex: 1 }}>
              {/* PAID badge + Order ID */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span className="badge badge-success" style={{ fontSize: '.7rem', fontWeight: 800, letterSpacing: '.04em' }}>
                  PAID
                </span>
                <span style={{ fontSize: '.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Order ID: <strong style={{ color: 'var(--text-primary)' }}>{orderId}</strong>
                </span>
              </div>

              {/* Customer name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700 }}>
                  {customerName}
                </span>
                {customer && (
                  <span style={{ background: 'var(--sidebar-bg)', color: 'var(--text-inverse)', fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '.04em' }}>
                    CUSTOMER
                  </span>
                )}
              </div>

              {/* Total */}
              <div className="text-2xl font-black text-[var(--accent-gold-text)]" style={{ marginBottom: 6 }}>
                {fmt(total)} <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Incl. Tax)</span>
              </div>

              {/* Items summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--text-secondary)', fontSize: '.82rem' }}>
                <SvgIcon name="inventory" width="14" height="14" />
                {cart.length === 1
                  ? firstItem.product.name
                  : `${cart.length} items`
                }
              </div>

              {/* Paid by */}
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                Paid by <strong>{paymentMethod}</strong>
                {paymentMethod === 'cash' && change > 0 && (
                  <span style={{ marginLeft: 8, color: 'var(--status-success)' }}>· Change: {fmt(change)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0 0 16px' }} />

          {/* Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, flex: 1 }}>
            {cart.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.83rem' }}>
                <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{item.product.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>× {item.qty}</span>
                  {item.isRental && item.days && (
                    <span style={{ color: 'var(--accent-gold-text)', fontSize: '.75rem', marginLeft: 6 }}>{item.days}d rental</span>
                  )}
                </div>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold-text)' }}>{fmt(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          {/* Print receipt button — styled like "Add Another Member" */}
          <button
            onClick={onPrintReceipt}
            className="btn btn-outline w-full"
            style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <SvgIcon name="printer" width="16" height="16" />
            Print Receipt
          </button>

          {/* Customer contact row */}
          {settings && (
            <div style={{ display: 'flex', gap: 32, marginTop: 4 }}>
              {settings.email && (
                <div>
                  <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', marginBottom: 2 }}>EMAIL</div>
                  <div style={{ fontSize: '.8rem', fontWeight: 600 }}>{settings.email}</div>
                </div>
              )}
              {settings.phone && (
                <div>
                  <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', marginBottom: 2 }}>PHONE</div>
                  <div style={{ fontSize: '.8rem', fontWeight: 600 }}>{settings.phone}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right / Status card ── */}
        <div style={{
          background: 'var(--bg-panel-hover)',
          borderLeft: '1px solid var(--border-subtle)',
          borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.08em' }}>ORDER STATUS</span>
            <div className="w-6 h-6 rounded-full bg-[var(--status-success-subtle)] flex items-center justify-center">
              <SvgIcon name="check-circle" width="14" height="14" style={{ color: 'var(--status-success)' }} />
            </div>
          </div>

          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            Order successfully placed
          </div>

          {/* Store info */}
          {settings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '.8rem' }}>
              <div>
                <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>Store:</div>
                <div style={{ fontWeight: 700 }}>{settings.name || 'TuxedoPOS'}</div>
              </div>
              {storeAddress && (
                <div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>Location:</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{storeAddress}</div>
                </div>
              )}
              {settings.phone && (
                <div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>Phone:</div>
                  <div style={{ fontWeight: 700 }}>{settings.phone}</div>
                </div>
              )}
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* New Order button */}
          <button
            onClick={onClose}
            className="btn btn-gold"
            style={{ width: '100%', fontSize: '.82rem' }}
          >
            + New Order
          </button>

          {/* Cancel / refund link */}
          <button className="btn btn-danger w-full" style={{ fontSize: '.75rem', letterSpacing: '.04em' }}>
            CANCEL ORDER &amp; REFUND
          </button>
        </div>
      </div>
    </Modal>
  );
};
