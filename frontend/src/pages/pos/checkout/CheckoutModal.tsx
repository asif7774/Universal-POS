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
            className="btn btn-gold btn-lg w-full flex items-center gap-1.5"
            onClick={processOrder}
            disabled={(paymentMethod === 'cash' && (parseFloat(cashGiven) < total || !cashGiven)) || processingPayment || isPending}
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
      <div className="flex flex-col gap-4">
        {/* Total */}
        <div className="bg-[var(--bg-panel-hover)] rounded-[var(--radius-md)] p-[14px] text-center">
          <div className="text-[.8rem] text-[var(--text-muted)] mb-1">AMOUNT DUE</div>
          <div className="text-2xl font-black tracking-tight text-[var(--accent-gold-text)]">{fmt(total)}</div>
        </div>

        {/* Customer */}
        <div>
          <label className="input-label mb-1.5 block">Customer (optional)</label>
          {selectedCustomer ? (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-[var(--bg-panel-hover)] rounded-lg border-[1.5px] border-[var(--accent-gold)]">
              <div className="avatar w-7 h-7 text-[.65rem] shrink-0">
                {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
              </div>
              <span className="flex-1 font-semibold text-[.85rem]">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
              <button onClick={() => { setSelectedCustomer(null); }} className="btn btn-ghost btn-icon" aria-label="Close">
                <SvgIcon name="close" width="14" height="14" />
              </button>
            </div>
          ) : (
            <div>
              <input className="input mb-1" placeholder="Search customer..." value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); }} />
              {customerSearch && (
                <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-panel)] max-h-[120px] overflow-y-auto">
                  {customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 5).map(c => (
                    <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                      className="px-3 py-2 cursor-pointer text-[.85rem] border-b border-[var(--border-subtle)]"
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-panel-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {c.firstName} {c.lastName}
                    </div>
                  ))}
                  {customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-[.82rem] text-[var(--text-muted)]">No customers found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plugin Extensions (before-payment) */}
        {checkoutExtensions.length > 0 && (
          <div className="mb-4">
            {checkoutExtensions.map(ext => (
              <div key={ext.id}>{ext.component}</div>
            ))}
          </div>
        )}

        {/* Payment method */}
        <div>
          <div className="input-label mb-2">Payment Method</div>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => { setPaymentMethod(m.id); }}
                className={`btn flex-1 flex-col items-center gap-1.5 py-3 ${paymentMethod === m.id ? 'btn-gold' : 'btn-outline'}`}
              >
                <SvgIcon name={m.icon} width="24" height="24" />
                <span className="text-[.75rem] font-semibold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash tendered */}
        {paymentMethod === 'cash' && (
          <div className="input-group">
            <label className="input-label">Cash Tendered</label>
            <div className="flex gap-1.5 flex-wrap mb-1.5">
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
              <div className="text-[.9rem] font-bold mt-1" style={{ color: change >= 0 ? 'var(--status-success)' : 'var(--status-error)' }}>
                Change: {change >= 0 ? fmt(change) : `Short by ${fmt(-change)}`}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
