import { pgTable, uuid, varchar, text, integer, numeric, boolean, timestamp, date, jsonb, index } from 'drizzle-orm/pg-core';

// ── Tenants ───────────────────────────────────────────────────
export const tenants = pgTable('tenants', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         varchar('name', { length: 120 }).notNull(),
  slug:         varchar('slug', { length: 60 }).notNull().unique(),
  plan:         varchar('plan', { length: 30 }).notNull().default('starter'),
  taxRate:      numeric('tax_rate', { precision: 5, scale: 4 }).notNull().default('0.0875'),
  currency:     varchar('currency', { length: 3 }).notNull().default('USD'),
  timezone:     varchar('timezone', { length: 60 }).notNull().default('America/New_York'),
  logoUrl:      text('logo_url'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#1E3A5F'),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ── Stores ────────────────────────────────────────────────────
export const stores = pgTable('stores', {
  id:        uuid('id').primaryKey().defaultRandom(),
  tenantId:  uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name:      varchar('name', { length: 120 }).notNull(),
  address:   text('address'),
  city:      varchar('city', { length: 80 }),
  state:     varchar('state', { length: 2 }),
  zip:       varchar('zip', { length: 10 }),
  phone:     varchar('phone', { length: 20 }),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [index('stores_tenant_idx').on(t.tenantId)]);

// ── Users ─────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  tenantId:     uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  storeId:      uuid('store_id').references(() => stores.id),
  name:         varchar('name', { length: 100 }).notNull(),
  email:        varchar('email', { length: 200 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  pinHash:      varchar('pin_hash', { length: 255 }),
  role:         varchar('role', { length: 20 }).notNull().default('cashier'),
  isActive:     boolean('is_active').notNull().default(true),
  lastLoginAt:  timestamp('last_login_at'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
}, t => [
  index('users_tenant_idx').on(t.tenantId),
  index('users_email_idx').on(t.email),
]);

// ── Customers ─────────────────────────────────────────────────
export const customers = pgTable('customers', {
  id:             uuid('id').primaryKey().defaultRandom(),
  tenantId:       uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  storeId:        uuid('store_id').references(() => stores.id),
  firstName:      varchar('first_name', { length: 60 }).notNull(),
  lastName:       varchar('last_name', { length: 60 }).notNull(),
  email:          varchar('email', { length: 200 }),
  phone:          varchar('phone', { length: 20 }),
  notes:          text('notes'),
  tags:           jsonb('tags').default([]),
  loyaltyPoints:  integer('loyalty_points').notNull().default(0),
  totalOrders:    integer('total_orders').notNull().default(0),
  totalSpent:     numeric('total_spent', { precision: 10, scale: 2 }).notNull().default('0'),
  lastVisitAt:    timestamp('last_visit_at'),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
  updatedAt:      timestamp('updated_at').notNull().defaultNow(),
}, t => [
  index('customers_tenant_idx').on(t.tenantId),
  index('customers_phone_idx').on(t.phone),
]);

// ── Customer Measurements ─────────────────────────────────────
export const measurements = pgTable('measurements', {
  id:           uuid('id').primaryKey().defaultRandom(),
  customerId:   uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  tenantId:     uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  takenById:    uuid('taken_by_id').references(() => users.id),
  jacketSize:   varchar('jacket_size', { length: 10 }),
  chest:        varchar('chest', { length: 10 }),
  waist:        varchar('waist', { length: 10 }),
  hips:         varchar('hips', { length: 10 }),
  inseam:       varchar('inseam', { length: 10 }),
  outseam:      varchar('outseam', { length: 10 }),
  neck:         varchar('neck', { length: 10 }),
  sleeve:       varchar('sleeve', { length: 10 }),
  shoulder:     varchar('shoulder', { length: 10 }),
  shoeSize:     varchar('shoe_size', { length: 8 }),
  height:       varchar('height', { length: 12 }),
  weight:       varchar('weight', { length: 12 }),
  notes:        text('notes'),
  fittingNotes: text('fitting_notes'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
}, t => [index('measurements_customer_idx').on(t.customerId)]);

// ── Products ──────────────────────────────────────────────────
export const products = pgTable('products', {
  id:               uuid('id').primaryKey().defaultRandom(),
  tenantId:         uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  sku:              varchar('sku', { length: 60 }).notNull(),
  name:             varchar('name', { length: 200 }).notNull(),
  description:      text('description'),
  type:             varchar('type', { length: 20 }).notNull(),        // rental | sale | service
  category:         varchar('category', { length: 60 }).notNull(),
  salePrice:        numeric('sale_price', { precision: 10, scale: 2 }),
  rentalRatePerDay: numeric('rental_rate_per_day', { precision: 8, scale: 2 }),
  depositAmount:    numeric('deposit_amount', { precision: 8, scale: 2 }),
  taxable:          boolean('taxable').notNull().default(true),
  trackInventory:   boolean('track_inventory').notNull().default(true),
  isActive:         boolean('is_active').notNull().default(true),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
}, t => [
  index('products_tenant_idx').on(t.tenantId),
  index('products_sku_idx').on(t.sku, t.tenantId),
]);

// ── Inventory (per size/variant) ──────────────────────────────
export const inventory = pgTable('inventory', {
  id:            uuid('id').primaryKey().defaultRandom(),
  productId:     uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  tenantId:      uuid('tenant_id').notNull().references(() => tenants.id),
  storeId:       uuid('store_id').references(() => stores.id),
  size:          varchar('size', { length: 20 }).notNull(),
  color:         varchar('color', { length: 40 }),
  totalQty:      integer('total_qty').notNull().default(0),
  availableQty:  integer('available_qty').notNull().default(0),
  rentedQty:     integer('rented_qty').notNull().default(0),
  cleaningQty:   integer('cleaning_qty').notNull().default(0),
  damagedQty:    integer('damaged_qty').notNull().default(0),
  location:      varchar('location', { length: 60 }),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
}, t => [
  index('inventory_product_idx').on(t.productId),
  index('inventory_tenant_idx').on(t.tenantId),
]);

// ── Orders ────────────────────────────────────────────────────
export const orders = pgTable('orders', {
  id:            uuid('id').primaryKey().defaultRandom(),
  tenantId:      uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  storeId:       uuid('store_id').references(() => stores.id),
  customerId:    uuid('customer_id').references(() => customers.id),
  cashierId:     uuid('cashier_id').references(() => users.id),
  orderNo:       varchar('order_no', { length: 30 }).notNull(),
  status:        varchar('status', { length: 30 }).notNull().default('pending'),
  type:          varchar('type', { length: 20 }).notNull().default('sale'),  // sale | rental | mixed
  subtotal:      numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discountPct:   numeric('discount_pct', { precision: 5, scale: 2 }).notNull().default('0'),
  discountAmt:   numeric('discount_amt', { precision: 10, scale: 2 }).notNull().default('0'),
  taxRate:       numeric('tax_rate', { precision: 5, scale: 4 }).notNull(),
  taxAmt:        numeric('tax_amt', { precision: 10, scale: 2 }).notNull(),
  total:         numeric('total', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }),
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('unpaid'),
  notes:         text('notes'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
}, t => [
  index('orders_tenant_idx').on(t.tenantId),
  index('orders_customer_idx').on(t.customerId),
  index('orders_no_idx').on(t.orderNo),
]);

// ── Order Line Items ──────────────────────────────────────────
export const orderItems = pgTable('order_items', {
  id:        uuid('id').primaryKey().defaultRandom(),
  orderId:   uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id),
  name:      varchar('name', { length: 200 }).notNull(),
  sku:       varchar('sku', { length: 60 }),
  isRental:  boolean('is_rental').notNull().default(false),
  qty:       integer('qty').notNull().default(1),
  days:      integer('days'),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric('line_total', { precision: 10, scale: 2 }).notNull(),
  size:      varchar('size', { length: 20 }),
  notes:     text('notes'),
}, t => [index('order_items_order_idx').on(t.orderId)]);

// ── Rentals ───────────────────────────────────────────────────
export const rentals = pgTable('rentals', {
  id:              uuid('id').primaryKey().defaultRandom(),
  tenantId:        uuid('tenant_id').notNull().references(() => tenants.id),
  orderId:         uuid('order_id').references(() => orders.id),
  customerId:      uuid('customer_id').notNull().references(() => customers.id),
  rentalNo:        varchar('rental_no', { length: 30 }).notNull(),
  status:          varchar('status', { length: 20 }).notNull().default('booked'),
  eventName:       varchar('event_name', { length: 200 }),
  eventDate:       date('event_date'),
  pickupDate:      date('pickup_date').notNull(),
  returnDate:      date('return_date').notNull(),
  actualReturnAt:  timestamp('actual_return_at'),
  depositPaid:     numeric('deposit_paid', { precision: 8, scale: 2 }).notNull().default('0'),
  depositReturned: numeric('deposit_returned', { precision: 8, scale: 2 }).notNull().default('0'),
  lateFeeCharged:  numeric('late_fee_charged', { precision: 8, scale: 2 }).notNull().default('0'),
  damageFee:       numeric('damage_fee', { precision: 8, scale: 2 }).notNull().default('0'),
  notes:           text('notes'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
  updatedAt:       timestamp('updated_at').notNull().defaultNow(),
}, t => [
  index('rentals_tenant_idx').on(t.tenantId),
  index('rentals_customer_idx').on(t.customerId),
  index('rentals_return_idx').on(t.returnDate),
]);

// ── Rental Items ──────────────────────────────────────────────
export const rentalItems = pgTable('rental_items', {
  id:          uuid('id').primaryKey().defaultRandom(),
  rentalId:    uuid('rental_id').notNull().references(() => rentals.id, { onDelete: 'cascade' }),
  inventoryId: uuid('inventory_id').references(() => inventory.id),
  productId:   uuid('product_id').references(() => products.id),
  productName: varchar('product_name', { length: 200 }).notNull(),
  size:        varchar('size', { length: 20 }),
  barcode:     varchar('barcode', { length: 60 }),
  checkedOutAt:timestamp('checked_out_at'),
  checkedInAt: timestamp('checked_in_at'),
  condition:   varchar('condition', { length: 20 }).default('good'),
  notes:       text('notes'),
}, t => [index('rental_items_rental_idx').on(t.rentalId)]);

// ── Appointments ──────────────────────────────────────────────
export const appointments = pgTable('appointments', {
  id:         uuid('id').primaryKey().defaultRandom(),
  tenantId:   uuid('tenant_id').notNull().references(() => tenants.id),
  storeId:    uuid('store_id').references(() => stores.id),
  customerId: uuid('customer_id').references(() => customers.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  orderId:    uuid('order_id').references(() => orders.id),
  type:       varchar('type', { length: 30 }).notNull(),
  status:     varchar('status', { length: 20 }).notNull().default('scheduled'),
  date:       date('date').notNull(),
  startTime:  varchar('start_time', { length: 5 }).notNull(),
  duration:   integer('duration').notNull().default(30),
  notes:      text('notes'),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
}, t => [
  index('appointments_tenant_idx').on(t.tenantId),
  index('appointments_date_idx').on(t.date),
]);

// ── Tailoring Jobs ────────────────────────────────────────────
export const tailoringJobs = pgTable('tailoring_jobs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tenantId:    uuid('tenant_id').notNull().references(() => tenants.id),
  customerId:  uuid('customer_id').references(() => customers.id),
  assignedTo:  uuid('assigned_to').references(() => users.id),
  orderId:     uuid('order_id').references(() => orders.id),
  jobNo:       varchar('job_no', { length: 30 }).notNull(),
  type:        varchar('type', { length: 30 }).notNull(),
  status:      varchar('status', { length: 30 }).notNull().default('pending'),
  garment:     varchar('garment', { length: 200 }).notNull(),
  description: text('description'),
  notes:       text('notes'),
  price:       numeric('price', { precision: 8, scale: 2 }).notNull(),
  dueDate:     date('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
}, t => [index('tailoring_tenant_idx').on(t.tenantId)]);
