import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { orders, orderItems, customers } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  name: string;
  sku?: string | null;
  isRental: boolean;
  qty: number;
  days?: number | null;
  unitPrice: string | null;
  lineTotal: string | null;
  size?: string | null;
}

export interface Order {
  id: string;
  tenantId: string;
  storeId: string | null;
  customerId?: string | null;
  cashierId: string | null;
  orderNo: string;
  status: string;
  type: string;
  subtotal: string | null;
  discountPct: string | null;
  discountAmt: string | null;
  taxRate: string | null;
  taxAmt: string | null;
  total: string | null;
  paymentMethod?: string | null;
  paymentStatus: string;
  notes?: string | null;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const generateOrderNo = () => `ORD-${Date.now().toString().slice(-6)}`;

@Injectable()
export class OrdersService {
  async findAll(tenantId: string, limit = 50, offset = 0): Promise<Order[]> {
    const res = await db.select({
      order: orders,
      customer: {
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
      }
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.tenantId, tenantId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

    return res.map(row => ({ ...row.order, customer: row.customer })) as unknown as Order[];
  }

  async findById(id: string, tenantId: string): Promise<Order> {
    const res = await db.select({
      order: orders,
      customer: {
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        email: customers.email,
        phone: customers.phone,
      }
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
    .limit(1);

    if (!res[0]) throw new NotFoundException(`Order ${id} not found`);
    
    const itemsRes = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...res[0].order, customer: res[0].customer, items: itemsRes } as unknown as Order;
  }

  async findByCustomer(customerId: string, tenantId: string): Promise<Order[]> {
    const res = await db.select().from(orders).where(and(eq(orders.customerId, customerId), eq(orders.tenantId, tenantId))).orderBy(desc(orders.createdAt));
    return res as unknown as Order[];
  }

  async create(tenantId: string, storeId: string, cashierId: string, data: any): Promise<Order> {
    const { items, ...orderData } = data;
    
    const [order] = await db.insert(orders).values({
      tenantId, storeId, cashierId,
      orderNo: generateOrderNo(),
      ...orderData
    }).returning();
    
    if (items && items.length > 0) {
      await db.insert(orderItems).values(items.map((i: any) => ({ ...i, orderId: order.id })));
    }
    
    return { ...order, items } as unknown as Order;
  }

  async updateStatus(id: string, tenantId: string, status: string): Promise<Order> {
    const res = await db.update(orders).set({ status, updatedAt: new Date() }).where(and(eq(orders.id, id), eq(orders.tenantId, tenantId))).returning();
    if (!res[0]) throw new NotFoundException();
    return res[0] as unknown as Order;
  }

  async getDailySummary(tenantId: string, date: string) {
    // Basic memory filter for MVP to avoid complex date functions in SQLite/PG
    const all = await db.select().from(orders).where(and(eq(orders.tenantId, tenantId), eq(orders.status, 'completed')));
    const dayOrders = all.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === date);
    
    const revenue = dayOrders.reduce((s, o) => s + parseFloat(o.total as unknown as string), 0);
    const count = dayOrders.length;
    const rentalCount = dayOrders.filter(o => o.type === 'rental' || o.type === 'mixed').length;
    
    return { date, revenue, count, rentalCount, orders: dayOrders };
  }

  async findRecent(tenantId: string, limit = 5, date?: string): Promise<Order[]> {
    const res = await db.select({
      order: orders,
      customer: {
        firstName: customers.firstName,
        lastName: customers.lastName,
      }
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.tenantId, tenantId))
    .orderBy(desc(orders.createdAt))
    .limit(date ? 200 : limit);

    const mapped = res.map(row => ({
      ...row.order,
      customerName: row.customer?.firstName
        ? `${row.customer.firstName} ${row.customer.lastName || ''}`.trim()
        : 'Guest'
    })) as any[];

    if (!date) return mapped.slice(0, limit);

    return mapped
      .filter(o => new Date(o.createdAt).toISOString().split('T')[0] === date)
      .slice(0, limit);
  }
}
