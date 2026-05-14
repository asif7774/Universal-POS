import React, { useState, useCallback, useRef, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  type: 'sale' | 'rental';
  category: string;
  stock: number;
  rentalRate?: number;  // per day
}

interface CartItem {
  product: Product;
  qty: number;
  days?: number;       // for rentals
  isRental: boolean;
  lineTotal: number;
}

// ── Mock product catalog ──────────────────────────────────────
const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Black Classic Tuxedo', sku: 'TUX-BLK-001', price: 599, rentalRate: 85, type: 'rental', category: 'Tuxedos', stock: 8 },
  { id: 'p2', name: 'Navy Slim Fit Tuxedo', sku: 'TUX-NVY-002', price: 649, rentalRate: 90, type: 'rental', category: 'Tuxedos', stock: 5 },
  { id: 'p3', name: 'White Dinner Jacket', sku: 'TUX-WHT-003', price: 549, rentalRate: 75, type: 'rental', category: 'Tuxedos', stock: 4 },
  { id: 'p4', name: 'Charcoal Suit', sku: 'SUT-CHR-001', price: 499, rentalRate: 65, type: 'rental', category: 'Suits', stock: 6 },
  { id: 'p5', name: 'Black Bow Tie', sku: 'ACC-BT-001', price: 24.99, type: 'sale', category: 'Accessories', stock: 30 },
  { id: 'p6', name: 'White Dress Shirt', sku: 'SHT-WHT-001', price: 49.99, type: 'sale', category: 'Shirts', stock: 20 },
  { id: 'p7', name: 'Black Patent Shoes', sku: 'SHO-BLK-001', price: 149, rentalRate: 25, type: 'rental', category: 'Shoes', stock: 10 },
  { id: 'p8', name: 'Cummerbund', sku: 'ACC-CB-001', price: 19.99, type: 'sale', category: 'Accessories', stock: 25 },
  { id: 'p9', name: 'Suspenders', sku: 'ACC-SUS-001', price: 14.99, type: 'sale', category: 'Accessories', stock: 18 },
  { id: 'p10', name: 'Pocket Square', sku: 'ACC-PS-001', price: 9.99, type: 'sale', category: 'Accessories', stock: 40 },
  { id: 'p11', name: 'Alteration — Hem', sku: 'SVC-ALT-001', price: 25, type: 'sale', category: 'Services', stock: 999 },
  { id: 'p12', name: 'Alteration — Waist', sku: 'SVC-ALT-002', price: 35, type: 'sale', category: 'Services', stock: 999 },
];

const CATEGORIES = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

const TAX_RATE = 0.0875; // 8.75% CA sales tax example

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'check', label: 'Check', icon: '📝' },
];

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toFixed(2)}`;

// ── POS Terminal ──────────────────────────────────────────────
const POS: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashGiven, setCashGiven] = useState('');
  const [discount, setDiscount] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const [barcodeFlash, setBarcodeFlash] = useState('');
  const barcodeBuffer = useRef('');
  const barcodeTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const addToCart = useCallback((product: Product, isRental = false) => {
    setCart(prev => {
      const key = `${product.id}-${isRental}`;
      const existing = prev.find(i => `${i.product.id}-${i.isRental}` === key);
      if (existing) {
        return prev.map(i =>
          `${i.product.id}-${i.isRental}` === key
            ? { ...i, qty: i.qty + 1, lineTotal: (i.isRental ? (i.product.rentalRate ?? 0) * (i.days ?? 1) : i.product.price) * (i.qty + 1) }
            : i
        );
      }
      const price = isRental ? (product.rentalRate ?? 0) : product.price;
      return [...prev, { product, qty: 1, isRental, days: isRental ? 1 : undefined, lineTotal: price }];
    });
  }, []);

  // Barcode scanner — detects rapid keystrokes (< 50ms apart) ending with Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input normally
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if ((e.target as HTMLInputElement).id !== 'pos-search') return;
      }
      clearTimeout(barcodeTimer.current);
      if (e.key === 'Enter' && barcodeBuffer.current.length > 3) {
        const sku = barcodeBuffer.current.trim().toUpperCase();
        const hit = PRODUCTS.find(p => p.sku.toUpperCase() === sku);
        if (hit) {
          addToCart(hit, hit.type === 'rental');
          setBarcodeFlash(hit.name);
          setTimeout(() => setBarcodeFlash(''), 2000);
        } else {
          setSearch(sku);
        }
        barcodeBuffer.current = '';
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        barcodeTimer.current = setTimeout(() => { barcodeBuffer.current = ''; }, 100);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addToCart]);

  // Cart calculations
  const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxable = subtotal - discountAmt;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;
  const change = parseFloat(cashGiven) - total;

  const filtered = PRODUCTS.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });



  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = { ...updated[idx] };
      item.qty = Math.max(0, item.qty + delta);
      if (item.qty === 0) {
        updated.splice(idx, 1);
        return updated;
      }
      const unit = item.isRental ? (item.product.rentalRate ?? 0) * (item.days ?? 1) : item.product.price;
      item.lineTotal = unit * item.qty;
      updated[idx] = item;
      return updated;
    });
  };

  const updateDays = (idx: number, days: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = { ...updated[idx] };
      item.days = Math.max(1, days);
      item.lineTotal = (item.product.rentalRate ?? 0) * item.days * item.qty;
      updated[idx] = item;
      return updated;
    });
  };

  const processOrder = () => {
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderId(id);
    setOrderComplete(true);
    // TODO: POST to API
  };

  const newOrder = () => {
    setCart([]);
    setDiscount(0);
    setCashGiven('');
    setCheckoutOpen(false);
    setOrderComplete(false);
    setOrderId('');
    searchRef.current?.focus();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', height: 'calc(100vh - 48px)', gap: 0, margin: '-24px', overflow: 'hidden' }}>

      {/* LEFT — Product Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-bg)', overflow: 'hidden' }}>

        {/* Search + category bar */}
        <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="input-with-icon" style={{ flex: 1 }}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input
              id="pos-search"
              ref={searchRef}
              className="input"
              placeholder="Search products or scan barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '.75rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Barcode flash indicator */}
          {barcodeFlash && (
            <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'var(--tux-navy)', color: 'white', padding: '8px 18px', borderRadius: 999, fontSize: '.85rem', fontWeight: 700, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 8, animation: 'slideDown .2s ease' }}>
              <span>📦</span> Added: {barcodeFlash}
              <style>{`@keyframes slideDown { from { opacity:0; transform: translateX(-50%) translateY(-10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
            </div>
          )}
        </div>

        {/* Products */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No products found for "<strong>{search}</strong>"</p>
            </div>
          ) : (
            <div className="pos-product-grid">
              {filtered.map(product => (
                <div
                  key={product.id}
                  className="pos-product-card"
                  onClick={() => addToCart(product, product.type === 'rental')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && addToCart(product, product.type === 'rental')}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>
                    {product.category === 'Tuxedos' ? '🎩' :
                     product.category === 'Suits' ? '👔' :
                     product.category === 'Accessories' ? '🎀' :
                     product.category === 'Shoes' ? '👞' :
                     product.category === 'Shirts' ? '👕' : '✂️'}
                  </div>
                  <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.2 }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>{product.sku}</div>
                  {product.type === 'rental' ? (
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{fmt(product.rentalRate ?? 0)}<span style={{ fontWeight: 400, fontSize: '.7rem' }}>/day</span></div>
                      <div className="badge badge-gold" style={{ marginTop: 4 }}>Rental</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{fmt(product.price)}</div>
                  )}
                  <div style={{ fontSize: '.7rem', color: product.stock < 3 ? 'var(--status-error)' : 'var(--text-muted)', marginTop: 4 }}>
                    {product.category === 'Services' ? 'Service' : `${product.stock} in stock`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Cart Panel */}
      <div style={{
        background: 'var(--surface-card)',
        borderLeft: '1px solid var(--surface-border)',
        display: 'flex', flexDirection: 'column',
        height: '100%', overflow: 'hidden',
      }}>
        {/* Cart header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '.95rem' }}>
            🛒 Cart {cart.length > 0 && <span className="badge badge-navy" style={{ marginLeft: 6 }}>{cart.length}</span>}
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
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🛒</div>
              <p style={{ fontSize: '.85rem' }}>Click a product to add it to the cart</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{
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
              onClick={() => setCheckoutOpen(true)}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && !orderComplete && (
        <div className="modal-overlay" onClick={() => setCheckoutOpen(false)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>Checkout</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setCheckoutOpen(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Total */}
              <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>AMOUNT DUE</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--tux-navy)' }}>{fmt(total)}</div>
              </div>

              {/* Payment method */}
              <div>
                <div className="input-label" style={{ marginBottom: 8 }}>Payment Method</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                      style={{
                        flex: 1, padding: '10px 6px', borderRadius: 'var(--radius-md)',
                        border: `2px solid ${paymentMethod === m.id ? 'var(--tux-navy)' : 'var(--surface-border)'}`,
                        background: paymentMethod === m.id ? '#EEF2F8' : 'var(--surface-card)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                      }}>
                      <div style={{ fontSize: '1.3rem' }}>{m.icon}</div>
                      <div style={{ fontSize: '.75rem', fontWeight: 600, color: paymentMethod === m.id ? 'var(--tux-navy)' : 'var(--text-secondary)' }}>{m.label}</div>
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
                      <button key={v} onClick={() => setCashGiven(v.toString())}
                        className="btn btn-outline btn-sm">
                        {fmt(v)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number" className="input" placeholder="0.00"
                    value={cashGiven} onChange={e => setCashGiven(e.target.value)}
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

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCheckoutOpen(false)}>Cancel</button>
              <button
                className="btn btn-gold"
                onClick={processOrder}
                disabled={paymentMethod === 'cash' && (parseFloat(cashGiven) < total || !cashGiven)}
              >
                ✓ Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Complete */}
      {orderComplete && (
        <div className="modal-overlay">
          <div className="modal animate-slide-up" style={{ maxWidth: 380, textAlign: 'center' }}>
            <div className="modal-body" style={{ padding: '36px 32px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>✅</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: 6 }}>Sale Complete!</h3>
              <code style={{ fontSize: '.85rem', color: 'var(--tux-navy)', fontWeight: 700 }}>{orderId}</code>

              <div style={{ margin: '20px 0', padding: '14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items</span><span style={{ fontWeight: 600 }}>{cart.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Charged</span><span style={{ fontWeight: 700, color: 'var(--tux-navy)' }}>{fmt(total)}</span>
                </div>
                {paymentMethod === 'cash' && change > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Change</span><span style={{ fontWeight: 700, color: 'var(--status-success)' }}>{fmt(change)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{paymentMethod}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                <button className="btn btn-outline" style={{ width: '100%', fontSize: '.85rem' }}>
                  🖨️ Print Receipt
                </button>
                <button className="btn btn-gold" style={{ width: '100%' }} onClick={newOrder}>
                  + New Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
