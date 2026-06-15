import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  cashGiven: string;
  setCashGiven: (v: string) => void;
  change: number;
  customerSearch: string;
  setCustomerSearch: (v: string) => void;
  selectedCustomer: any;
  setSelectedCustomer: (c: any) => void;
  customers: any[];
  processOrder: () => void;
  processingPayment: boolean;
  isPending: boolean;
  checkoutExtensions: any[];
}

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'banknote' },
  { id: 'card', label: 'Card', icon: 'credit-card' },
  { id: 'check', label: 'Check', icon: 'receipt' },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const CheckoutModal = ({
  isOpen, onClose, total, paymentMethod, setPaymentMethod, cashGiven, setCashGiven, change,
  customerSearch, setCustomerSearch, selectedCustomer, setSelectedCustomer, customers,
  processOrder, processingPayment, isPending, checkoutExtensions
}: CheckoutModalProps) => {

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Checkout"
      maxWidth={420}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={processingPayment || isPending}>Cancel</button>
          <button
            className="btn btn-gold btn-lg w-full"
            onClick={processOrder}
            disabled={(paymentMethod === 'cash' && (parseFloat(cashGiven) < total || !cashGiven)) || processingPayment || isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {processingPayment ? 'Processing Card...' : isPending ? 'Saving...' : (
              <>
                <SvgIcon name="check-circle" width="16" height="16" /> Complete Sale
              </>
            )}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Total */}
        <div style={{ background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>AMOUNT DUE</div>
          <div className="text-2xl font-black tracking-tight text-[var(--accent-gold-text)]">{fmt(total)}</div>
        </div>

        {/* Customer */}
        <div>
          <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Customer (optional)</label>
          {selectedCustomer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-panel-hover)', borderRadius: 8, border: '1.5px solid var(--accent-gold)' }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: '.65rem', flexShrink: 0 }}>
                {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: '.85rem' }}>{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
              <button onClick={() => { setSelectedCustomer(null); }} className="btn btn-ghost btn-icon" aria-label="Close">
                <SvgIcon name="close" width="14" height="14" />
              </button>
            </div>
          ) : (
            <div>
              <input className="input" placeholder="Search customer..." value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); }} style={{ marginBottom: 4 }} />
              {customerSearch && (
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--bg-panel)', maxHeight: 120, overflowY: 'auto' }}>
                  {customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 5).map(c => (
                    <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '.85rem', borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-panel-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {c.firstName} {c.lastName}
                    </div>
                  ))}
                  {customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                    <div style={{ padding: '8px 12px', fontSize: '.82rem', color: 'var(--text-muted)' }}>No customers found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plugin Extensions (before-payment) */}
        {checkoutExtensions.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {checkoutExtensions.map(ext => (
              <div key={ext.id}>{ext.component}</div>
            ))}
          </div>
        )}

        {/* Payment method */}
        <div>
          <div className="input-label" style={{ marginBottom: 8 }}>Payment Method</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => { setPaymentMethod(m.id); }}
                className={`btn flex-1 flex-col items-center gap-1.5 py-3 ${paymentMethod === m.id ? 'btn-gold' : 'btn-outline'}`}
              >
                <SvgIcon name={m.icon} width="24" height="24" />
                <span style={{ fontSize: '.75rem', fontWeight: 600 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash tendered */}
        {paymentMethod === 'cash' && (
          <div className="input-group">
            <label className="input-label">Cash Tendered</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {[Math.ceil(total), Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20, Math.ceil(total / 50) * 50].filter((v, i, a) => a.indexOf(v) === i).map(v => (
                <button key={v} onClick={() => { setCashGiven(v.toString()); }}
                  className="btn btn-outline btn-sm">
                  {fmt(v)}
                </button>
              ))}
            </div>
            <input
              type="number" className="input" placeholder="0.00"
              value={cashGiven} onChange={e => { setCashGiven(e.target.value); }}
              min={0} step="0.01"
            />
            {parseFloat(cashGiven) > 0 && (
              <div style={{ fontSize: '.9rem', fontWeight: 700, color: change >= 0 ? 'var(--status-success)' : 'var(--status-error)', marginTop: 4 }}>
                Change: {change >= 0 ? fmt(change) : `Short by ${fmt(-change)}`}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
