import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { useSnackbar } from 'contexts/SnackbarContext';
import { usePlugins } from 'contexts/PluginContext';
import { useSettings } from '../../lib/queries';
import { processCardPayment } from '../../lib/payments';
import { HAL } from '../../lib/hardware';
import { Product, CartItem } from 'types/pos';
import { InventoryItem } from 'types/inventory';
import { ProductGrid } from './components/ProductGrid';
import { TableSkeleton } from 'components/atoms/skeleton/Skeleton';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './checkout/CheckoutModal';
import { OrderCompleteModal } from './checkout/OrderCompleteModal';

const POS: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { getCheckoutExtensions } = usePlugins();
  const { data: settings } = useSettings();
  const TAX_RATE = settings?.taxRate ? parseFloat(settings.taxRate) / 100 : 0.0875;

  // -- State --
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
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch inventory for real stock levels
  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: () => apiClient.get<InventoryItem[]>('/inventory'),
    staleTime: 2 * 60 * 1000,
  });

  const { data: rawProducts = [], isLoading: isLoadingProducts } = useQuery<any[]>({
    queryKey: ['products-raw'],
    queryFn: () => apiClient.get<any[]>('/products'),
  });

  const products = React.useMemo(() => {
    return rawProducts.map(p => {
      // Cross-reference with inventory for real stock
      const inv = inventory.find((i: InventoryItem) => i.sku === p.sku);
      const totalStock = inv
        ? Object.values(inv.sizes).reduce((sum: number, s: { available: number }) => sum + s.available, 0)
        : 0;

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.salePrice ? parseFloat(p.salePrice) : 0,
        type: p.type,
        category: p.category,
        stock: totalStock,
        rentalRate: p.rentalRatePerDay ? parseFloat(p.rentalRatePerDay) : undefined
      } as Product;
    });
  }, [rawProducts, inventory]);

  const { data: customers = [] } = useQuery<{ id: string; firstName: string; lastName: string }[]>({
    queryKey: ['customers-list'],
    queryFn: () => apiClient.get('/customers'),
  });

  const CATEGORIES = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // -- Barcode / Add to Cart --
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if ((e.target as HTMLInputElement).id !== 'pos-search') { return; }
      }
      clearTimeout(barcodeTimer.current);
      if (e.key === 'Enter' && barcodeBuffer.current.length > 3) {
        const sku = barcodeBuffer.current.trim().toUpperCase();
        const hit = products.find(p => p.sku.toUpperCase() === sku);
        if (hit) {
          addToCart(hit, hit.type === 'rental');
          showSnackbar(`Added: ${hit.name}`, 'success');
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
    return () => { window.removeEventListener('keydown', onKey); };
  }, [addToCart, products]);

  // -- Cart Mutators --
  const updateQty = useCallback((idx: number, delta: number) => {
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
  }, []);

  const updateDays = useCallback((idx: number, days: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = { ...updated[idx] };
      item.days = Math.max(1, days);
      item.lineTotal = (item.product.rentalRate ?? 0) * item.days * item.qty;
      updated[idx] = item;
      return updated;
    });
  }, []);

  // -- Derived Totals --
  const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxable = subtotal - discountAmt;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;
  const change = parseFloat(cashGiven) - total;

  // -- API Mutation --
  const mutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiClient.post('/orders', orderData);
    },
    onSuccess: async (data: any) => {
      setOrderId(data.orderNo);
      setCompletedOrder(data);
      setOrderComplete(true);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showSnackbar(`Order ${data.orderNo} completed!`, 'success');

      if (paymentMethod === 'cash') {
        await HAL.openCashDrawer();
      }
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

  const printReceipt = async () => {
    const storeName = settings?.name || 'TuxedoPOS';
    const receiptItems = (completedOrder?.items ?? cart).map((i: any) => {
      const name = i.name ?? i.product?.name;
      const qty = i.qty;
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

    await HAL.printReceipt(receiptText);
  };

  return (
    <div className={`grid h-screen gap-0 -mx-6 -mb-6 overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out ${cart.length > 0 ? 'grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
      {isLoadingProducts ? (
        <div className="p-8"><TableSkeleton rows={10} cols={4} /></div>
      ) : (
        <ProductGrid
          products={products}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={CATEGORIES}
          onAddToCart={addToCart}
          searchRef={searchRef}
        />
      )}

      {cart.length > 0 && (
        <CartSidebar
          cart={cart}
          setCart={setCart}
          updateQty={updateQty}
          updateDays={updateDays}
          discount={discount}
          setDiscount={setDiscount}
          subtotal={subtotal}
          discountAmt={discountAmt}
          tax={tax}
          total={total}
          onCheckout={() => { setCheckoutOpen(true); }}
        />
      )}

      <CheckoutModal
        isOpen={checkoutOpen && !orderComplete}
        onClose={() => { setCheckoutOpen(false); }}
        total={total}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cashGiven={cashGiven}
        setCashGiven={setCashGiven}
        change={change}
        customerSearch={customerSearch}
        setCustomerSearch={setCustomerSearch}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        customers={customers}
        processOrder={processOrder}
        processingPayment={processingPayment}
        isPending={mutation.isPending}
        checkoutExtensions={getCheckoutExtensions('before-payment')}
      />

      <OrderCompleteModal
        isOpen={orderComplete}
        onClose={newOrder}
        orderId={orderId}
        cart={cart}
        total={total}
        paymentMethod={paymentMethod}
        change={change}
        onPrintReceipt={printReceipt}
      />
    </div>
  );
};

export default POS;
