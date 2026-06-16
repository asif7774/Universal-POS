import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { orders, orderItems, customers } from '../db/schema';
import { eq, and, desc, or, gte, lte, sql } from 'drizzle-orm';

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
    const [agg] = await db
      .select({
        revenue:      sql<string>`COALESCE(SUM(${orders.total}), 0)`,
        count:        sql<number>`COUNT(*)::int`,
        rentalCount:  sql<number>`COUNT(*) FILTER (WHERE ${orders.type} IN ('rental', 'mixed'))::int`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          or(eq(orders.status, 'completed'), eq(orders.paymentStatus, 'paid')),
          sql`${orders.createdAt}::date = ${date}::date`,
        ),
      );

    return {
      date,
      revenue: Math.round(parseFloat(agg?.revenue ?? '0') * 100) / 100,
      count: agg?.count ?? 0,
      rentalCount: agg?.rentalCount ?? 0,
    };
  }

  async findRecent(tenantId: string, limit = 5, date?: string): Promise<Order[]> {
    const conditions = [eq(orders.tenantId, tenantId)];

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end   = new Date(`${date}T23:59:59.999Z`);
      conditions.push(gte(orders.createdAt, start));
      conditions.push(lte(orders.createdAt, end));
    }

    const res = await db.select({
      order: orders,
      customer: {
        firstName: customers.firstName,
        lastName: customers.lastName,
      },
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

    return res.map(row => ({
      ...row.order,
      customerName: row.customer?.firstName
        ? `${row.customer.firstName} ${row.customer.lastName || ''}`.trim()
        : 'Guest',
    })) as any[];
  }
}
