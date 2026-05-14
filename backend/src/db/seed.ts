import { db } from './index';
import { tenants, stores, users, products, customers, measurements } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Tenant
  const [tenant] = await db.insert(tenants).values({
    name: 'TuxedoPOS HQ',
    slug: 'tuxedopos-hq',
  }).onConflictDoNothing().returning();

  let tenantId = tenant?.id;
  if (!tenantId) {
    const t = await db.select().from(tenants).where(eq(tenants.slug, 'tuxedopos-hq')).limit(1);
    tenantId = t[0].id;
  }

  // 2. Store
  const [store] = await db.insert(stores).values({
    tenantId,
    name: 'Main Store',
    city: 'New York',
    state: 'NY',
  }).onConflictDoNothing().returning();

  let storeId = store?.id;
  if (!storeId) {
    const s = await db.select().from(stores).where(eq(stores.tenantId, tenantId)).limit(1);
    storeId = s[0].id;
  }

  // 3. User
  await db.insert(users).values({
    tenantId,
    storeId,
    name: 'James Miller',
    email: 'admin@tuxedopos.com',
    passwordHash: 'password', // in real app, use bcrypt
    role: 'owner',
  }).onConflictDoNothing();

  await db.insert(users).values({
    tenantId,
    storeId,
    name: 'Tom Baker',
    email: 'cashier@tuxedopos.com',
    passwordHash: '123456',
    role: 'cashier',
  }).onConflictDoNothing();

  // 4. Products
  const sampleProducts = [
    { tenantId, sku: 'TUX-BLK-001', name: 'Black Classic Tuxedo', type: 'rental', category: 'Tuxedos', rentalRatePerDay: '85', taxable: true },
    { tenantId, sku: 'SUT-CHR-001', name: 'Charcoal Suit', type: 'rental', category: 'Suits', rentalRatePerDay: '65', taxable: true },
    { tenantId, sku: 'ACC-BT-001', name: 'Black Bow Tie', type: 'sale', category: 'Accessories', salePrice: '24.99', taxable: true },
    { tenantId, sku: 'SVC-ALT-001', name: 'Alteration — Hem', type: 'service', category: 'Services', salePrice: '25.00', taxable: false },
  ];
  for (const p of sampleProducts) {
    await db.insert(products).values(p).onConflictDoNothing();
  }

  // 5. Customers
  const [c1] = await db.insert(customers).values({
    tenantId, storeId, firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@email.com', phone: '(555) 234-5678', notes: 'Wedding May 15. VIP.', tags: ['Wedding', 'VIP'], loyaltyPoints: 620, totalOrders: 5, totalSpent: '1240.00'
  }).onConflictDoNothing().returning();
  await db.insert(customers).values({
    tenantId, storeId, firstName: 'David', lastName: 'Williams', email: 'david.w@email.com', phone: '(555) 345-6789', tags: ['Prom'], loyaltyPoints: 195, totalOrders: 2, totalSpent: '390.00'
  }).onConflictDoNothing();
  
  if (c1?.id) {
    await db.insert(measurements).values({
      customerId: c1.id, tenantId, takenById: undefined,
      jacketSize: '42R', chest: '42"', waist: '36"', hips: '42"', inseam: '32"', outseam: '42"', neck: '16"', sleeve: '34"', shoulder: '19"', shoeSize: '10.5', height: "6'1\"", weight: '185 lbs', notes: 'Prefers slim fit. Left shoulder slightly higher by ¼".', fittingNotes: 'Jacket hemmed at left shoulder.'
    }).onConflictDoNothing();
  }

  console.log('✅ Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
