import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { Modal } from 'components/atoms/modal/Modal';
import { useSnackbar } from 'contexts/SnackbarContext';
import { usePlugins } from 'contexts/PluginContext';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { processCardPayment } from '../lib/payments';

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
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { getCheckoutExtensions } = usePlugins();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashGiven, setCashGiven] = useState('');
  const [discount, setDiscount] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{id:string;firstName:string;lastName:string} | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await apiClient.get<any[]>('/products');
      return data.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.salePrice ? parseFloat(p.salePrice) : 0,
        type: p.type,
        category: p.category,
        stock: 99,
        rentalRate: p.rentalRatePerDay ? parseFloat(p.rentalRatePerDay) : undefined
      }));
    }
  });

  const { data: customers = [] } = useQuery<{id:string;firstName:string;lastName:string}[]>({
    queryKey: ['customers-list'],
    queryFn: () => apiClient.get('/customers'),
  });

  const CATEGORIES = ['All', ...Array.from(new Set(products.map(p => p.category)))];

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
        const hit = products.find(p => p.sku.toUpperCase() === sku);
        if (hit) {
          addToCart(hit, hit.type === 'rental');
          showSnackbar(`📦 Added: ${hit.name}`, 'success');
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
  }, [addToCart, products]);

  // Cart calculations
  const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxable = subtotal - discountAmt;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;
  const change = parseFloat(cashGiven) - total;

  const filtered = products.filter(p => {
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

  const mutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiClient.post('/orders', orderData);
    },
    onSuccess: (data: any) => {
      setOrderId(data.orderNo);
      setCompletedOrder(data);
      setOrderComplete(true);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showSnackbar(`✅ Order ${data.orderNo} completed!`, 'success');
    }
  });

  const processOrder = async () => {
    if (paymentMethod === 'card') {
      setProcessingPayment(true);
      const result = await processCardPayment(total);
      setProcessingPayment(false);
      
      if (!result.success) {
        showSnackbar(result.error || 'Card processing failed', 'error');
        return;
      }
      showSnackbar('Card approved!', 'success');
    }

    const orderData = {
      status: 'completed',
      type: cart.some(i => i.isRental) && cart.some(i => !i.isRental) ? 'mixed' : cart.some(i => i.isRental) ? 'rental' : 'sale',
      customerId: selectedCustomer?.id ?? null,
      subtotal: subtotal.toString(),
      discountPct: discount.toString(),
      discountAmt: discountAmt.toString(),
      taxRate: TAX_RATE.toString(),
      taxAmt: tax.toString(),
      total: total.toString(),
      paymentMethod,
      paymentStatus: 'paid',
      items: cart.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        sku: i.product.sku,
        isRental: i.isRental,
        qty: i.qty,
        days: i.days,
        unitPrice: (i.isRental ? i.product.rentalRate : i.product.price)?.toString(),
        lineTotal: i.lineTotal.toString()
      }))
    };
    mutation.mutate(orderData);
  };

  const newOrder = () => {
    setCart([]);
    setDiscount(0);
    setCashGiven('');
    setCheckoutOpen(false);
    setOrderComplete(false);
    setOrderId('');
    setCompletedOrder(null);
    setSelectedCustomer(null);
    setCustomerSearch('');
    searchRef.current?.focus();
  };

  const printReceipt = () => {
    const storeName = 'TuxedoPOS';
    const receiptItems = (completedOrder?.items ?? cart).map((i: any) => {
      const name = i.name ?? i.product?.name;
      const qty = i.qty;
      const unit = i.unitPrice ? parseFloat(i.unitPrice) : (i.product?.price ?? 0);
      const line = i.lineTotal ? parseFloat(i.lineTotal) : i.lineTotal;
      return `${name} x${qty}  $${line.toFixed(2)}`;
    }).join('\n');

    const receiptText = [
      storeName,
      '================================',
      `Order: ${orderId}`,
      `Date: ${new Date().toLocaleString()}`,
      `Customer: ${selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Walk-in'}`,
      `Payment: ${paymentMethod.toUpperCase()}`,
      '--------------------------------',
      receiptItems,
      '--------------------------------',
      `Subtotal:    $${subtotal.toFixed(2)}`,
      discount > 0 ? `Discount:   -$${discountAmt.toFixed(2)}` : '',
      `Tax (8.75%): $${tax.toFixed(2)}`,
      `TOTAL:       $${total.toFixed(2)}`,
      paymentMethod === 'cash' && change > 0 ? `Change:      $${change.toFixed(2)}` : '',
      '================================',
      'Thank you for choosing TuxedoPOS!',
    ].filter(Boolean).join('\n');

    const w = window.open('', '_blank', 'width=380,height=600');
    if (!w) return;
    w.document.write(`<html><head><title>Receipt ${orderId}</title><style>
      body{font-family:monospace;font-size:13px;padding:20px;white-space:pre;}
    </style></head><body>${receiptText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}<script>window.print();window.close();<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', height: 'calc(100vh - 48px)', gap: 0, margin: '-24px', overflow: 'hidden' }}>

      {/* LEFT — Product Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-bg)', overflow: 'hidden' }}>

        {/* Search + category bar */}
        <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="input-with-icon" style={{ flex: 1 }}>
            <span className="input-icon">
              <SvgIcon name="search" width="15" height="15" />
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
      <Modal 
        isOpen={checkoutOpen && !orderComplete} 
        onClose={() => setCheckoutOpen(false)}
        title="Checkout"
        maxWidth={420}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setCheckoutOpen(false)} disabled={processingPayment || mutation.isPending}>Cancel</button>
            <button
              className="btn btn-gold"
              onClick={processOrder}
              disabled={(paymentMethod === 'cash' && (parseFloat(cashGiven) < total || !cashGiven)) || processingPayment || mutation.isPending}
            >
              {processingPayment ? 'Processing Card...' : mutation.isPending ? 'Saving...' : '✓ Complete Sale'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Total */}
          <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>AMOUNT DUE</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--tux-navy)' }}>{fmt(total)}</div>
          </div>

          {/* Customer */}
          <div>
            <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Customer (optional)</label>
            {selectedCustomer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#EEF2F8', borderRadius: 8, border: '1.5px solid var(--tux-navy)' }}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: '.65rem', flexShrink: 0 }}>
                  {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '.85rem' }}>{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>✕</button>
              </div>
            ) : (
              <div>
                <input className="input" placeholder="Search customer..." value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)} style={{ marginBottom: 4 }} />
                {customerSearch && (
                  <div style={{ border: '1px solid var(--surface-border)', borderRadius: 8, background: 'var(--surface-card)', maxHeight: 120, overflowY: 'auto' }}>
                    {customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 5).map(c => (
                      <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '.85rem', borderBottom: '1px solid var(--surface-border)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
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
          {getCheckoutExtensions('before-payment').length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {getCheckoutExtensions('before-payment').map(ext => (
                <div key={ext.id}>{ext.component}</div>
              ))}
            </div>
          )}

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
      </Modal>

      {/* Order Complete */}
      <Modal 
        isOpen={orderComplete} 
        onClose={newOrder}
        maxWidth={380}
      >
        <div style={{ textAlign: 'center' }}>
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
            <button className="btn btn-outline" style={{ width: '100%', fontSize: '.85rem' }} onClick={printReceipt}>
              🖨️ Print Receipt
            </button>
            <button className="btn btn-gold" style={{ width: '100%' }} onClick={newOrder}>
              + New Order
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default POS;
