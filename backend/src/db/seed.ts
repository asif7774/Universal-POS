import { db } from './index';
import { tenants, stores, users, products, inventory, customers, measurements, orders, orderItems, rentals, appointments, tailoringJobs } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Tenants
  const [hqTenant] = await db.insert(tenants).values({
    name: 'TuxedoPOS HQ',
    slug: 'tuxedopos-hq',
    plan: 'enterprise',
    taxRate: '0.08875',
  }).onConflictDoUpdate({ target: tenants.slug, set: { name: 'TuxedoPOS HQ' } }).returning();

  const [prestigeTenant] = await db.insert(tenants).values({
    name: 'Prestige Formalwear',
    slug: 'prestige',
    plan: 'pro',
    taxRate: '0.075',
  }).onConflictDoUpdate({ target: tenants.slug, set: { name: 'Prestige Formalwear' } }).returning();

  const tenantId = hqTenant.id;
  const t2Id = prestigeTenant.id;

  // 2. Stores
  const [mainStore] = await db.insert(stores).values({
    tenantId,
    name: 'Manhattan Flagship',
    city: 'New York',
    state: 'NY',
    address: '123 Broadway St',
  }).returning();

  const [bkStore] = await db.insert(stores).values({
    tenantId,
    name: 'Brooklyn Outlet',
    city: 'Brooklyn',
    state: 'NY',
    address: '456 Atlantic Ave',
  }).returning();

  const storeId = mainStore.id;

  // 3. Users (Staff)
  const staff = await db.insert(users).values([
    { tenantId, storeId, name: 'James Miller', email: 'james@tuxedopos.com', passwordHash: 'pass', role: 'owner' },
    { tenantId, storeId, name: 'Sarah Wilson', email: 'sarah@tuxedopos.com', passwordHash: 'pass', role: 'manager' },
    { tenantId, storeId, name: 'Tom Baker', email: 'tom@tuxedopos.com', passwordHash: 'pass', role: 'cashier' },
    { tenantId, storeId: bkStore.id, name: 'Emma Davis', email: 'emma@tuxedopos.com', passwordHash: 'pass', role: 'cashier' },
    { tenantId, storeId, name: 'Robert Tailor', email: 'robert@tuxedopos.com', passwordHash: 'pass', role: 'cashier' },
  ]).returning();

  // 4. Products & Inventory
  const productData = [
    { sku: 'TUX-BLK-001', name: 'Black Peak Lapel Tuxedo', type: 'rental', category: 'Tuxedos', rentalRatePerDay: '85.00', depositAmount: '250.00' },
    { sku: 'TUX-BLU-002', name: 'Midnight Blue Slim Tuxedo', type: 'rental', category: 'Tuxedos', rentalRatePerDay: '95.00', depositAmount: '300.00' },
    { sku: 'SUT-CHR-001', name: 'Charcoal Modern Suit', type: 'rental', category: 'Suits', rentalRatePerDay: '65.00', depositAmount: '150.00' },
    { sku: 'SUT-GRY-002', name: 'Light Grey Summer Suit', type: 'rental', category: 'Suits', rentalRatePerDay: '65.00', depositAmount: '150.00' },
    { sku: 'SHI-WHT-001', name: 'Premium Wing Collar Shirt', type: 'sale', category: 'Shirts', salePrice: '45.00' },
    { sku: 'ACC-BT-001', name: 'Silk Bow Tie (Black)', type: 'sale', category: 'Accessories', salePrice: '24.99' },
    { sku: 'ACC-ST-001', name: 'Silver Cufflink Set', type: 'sale', category: 'Accessories', salePrice: '35.00' },
    { sku: 'SHO-PAT-001', name: 'Patent Leather Shoes', type: 'rental', category: 'Shoes', rentalRatePerDay: '25.00', depositAmount: '50.00' },
    { sku: 'SVC-ALT-001', name: 'Basic Alteration', type: 'service', category: 'Services', salePrice: '20.00', taxable: false },
  ];

  const sizes = ['36R', '38R', '40R', '42R', '44R', '38L', '40L', '42L'];

  for (const pd of productData) {
    const [p] = await db.insert(products).values({ ...pd, tenantId }).returning();

    if (pd.type !== 'service') {
      const invValues = sizes.map(size => ({
        tenantId,
        storeId,
        productId: p.id,
        size,
        totalQty: 5,
        availableQty: size === '40R' ? 1 : 5,
        rentedQty: size === '40R' ? 4 : 0,
        location: 'A-1',
      }));
      await db.insert(inventory).values(invValues);
    }
  }

  // ── Low-stock demo products ──────────────────────────────────────
  // Navy Velvet Smoking Jacket: critically low stock (1 of 10 per size = 10%)
  const [lowStockProduct] = await db.insert(products).values({
    tenantId,
    sku: 'TUX-NVY-003',
    name: 'Navy Velvet Smoking Jacket',
    type: 'rental',
    category: 'Tuxedos',
    rentalRatePerDay: '110.00',
    taxable: true,
    isActive: true,
    trackInventory: true,
  }).returning();

  await db.insert(inventory).values(
    sizes.map(size => ({
      tenantId, storeId,
      productId: lowStockProduct.id,
      size,
      totalQty: 10,
      availableQty: 1,      // 8 total available / 80 total = 10% → LOW STOCK
      rentedQty: 9,
      location: 'B-2',
    }))
  );

  // Burgundy Slim Suit: moderate stock (3 of 8 per size = ~38%)
  const [moderateStockProduct] = await db.insert(products).values({
    tenantId,
    sku: 'SUT-BRG-003',
    name: 'Burgundy Slim Fit Suit',
    type: 'rental',
    category: 'Suits',
    rentalRatePerDay: '70.00',
    taxable: true,
    isActive: true,
    trackInventory: true,
  }).returning();

  await db.insert(inventory).values(
    sizes.map(size => ({
      tenantId, storeId,
      productId: moderateStockProduct.id,
      size,
      totalQty: 8,
      availableQty: 3,      // 24 total available / 64 total = 37.5% → amber bar
      rentedQty: 5,
      location: 'C-1',
    }))
  );

  // 5. Customers & Measurements
  const customerList = [
    { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus@example.com', phone: '555-0101', loyaltyPoints: 450, totalOrders: 3, totalSpent: '850.00' },
    { firstName: 'David', lastName: 'Williams', email: 'david@example.com', phone: '555-0102', loyaltyPoints: 120, totalOrders: 1, totalSpent: '125.00' },
    { firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', phone: '555-0103', loyaltyPoints: 890, totalOrders: 6, totalSpent: '1540.00' },
    { firstName: 'Chris', lastName: 'Evans', email: 'chris@example.com', phone: '555-0104' },
  ];

  for (const [i, cd] of customerList.entries()) {
    const [c] = await db.insert(customers).values({ ...cd, tenantId, storeId }).returning();
    
    await db.insert(measurements).values({
      customerId: c.id,
      tenantId,
      takenById: staff[0].id,
      jacketSize: '40R',
      chest: '40"', waist: '34"', neck: '15.5"', sleeve: '33"', inseam: '30"', shoeSize: '10'
    });

    // 6. Historical Orders (Last 30 Days)
    const paymentMethods = ['credit_card', 'cash', 'gift_card', 'loyalty'];
    const orderStatuses = ['completed', 'completed', 'completed', 'cancelled'];
    const categories = ['Tuxedos', 'Suits', 'Accessories', 'Shoes', 'Services'];

    for (let j = 0; j < 60; j++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      const amount = (Math.random() * 200 + 50).toFixed(2);
      
      const [o] = await db.insert(orders).values({
        tenantId,
        storeId,
        customerId: c.id,
        cashierId: staff[Math.floor(Math.random() * staff.length)].id,
        orderNo: `ORD-${20000 + i * 100 + j}`,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        type: Math.random() > 0.5 ? 'rental' : 'sale',
        subtotal: amount,
        taxRate: '0.08875',
        taxAmt: (parseFloat(amount) * 0.08875).toFixed(2),
        total: (parseFloat(amount) * 1.08875).toFixed(2),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentStatus: 'paid',
        createdAt: date,
      }).returning();

      // Add a line item
      await db.insert(orderItems).values({
        orderId: o.id,
        name: `${categories[Math.floor(Math.random() * categories.length)]} Item`,
        unitPrice: amount,
        lineTotal: amount,
        qty: 1,
      });
    }

    // 7. Appointments
    const apptDate = new Date();
    apptDate.setDate(apptDate.getDate() + (Math.floor(Math.random() * 10) - 5));
    await db.insert(appointments).values({
      tenantId,
      storeId,
      customerId: c.id,
      assignedTo: staff[1].id,
      type: i % 2 === 0 ? 'Fitting' : 'Measurement',
      date: apptDate.toISOString().split('T')[0],
      startTime: `${10 + (i % 8)}:00`,
      duration: 30,
      status: apptDate < new Date() ? 'completed' : 'scheduled',
      notes: 'Standard appointment sequence',
    });

    // 8. Tailoring Jobs
    await db.insert(tailoringJobs).values({
      tenantId,
      customerId: c.id,
      assignedTo: staff[4].id,
      jobNo: `JOB-${30000 + i}`,
      type: 'Hemming',
      status: i % 3 === 0 ? 'completed' : 'in_progress',
      garment: 'Classic Tuxedo Pants',
      price: '25.00',
      dueDate: new Date(Date.now() + 86400000 * (i % 10)).toISOString().split('T')[0],
    });
  }

  // 9. Specific Active Rentals
  const [activeRentC] = await db.select().from(customers).limit(1);
  const [activeRental] = await db.insert(rentals).values({
    tenantId,
    customerId: activeRentC.id,
    rentalNo: 'RN-9001',
    status: 'out',
    eventName: 'Summer Gala',
    pickupDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    depositPaid: '150.00',
  }).returning();

  console.log('✅ Comprehensive Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
