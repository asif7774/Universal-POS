import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import { products, orders, orderItems } from '../db/schema';

@Injectable()
export class ReportsService {
  async getRevenue(tenantId: string, period: string) {
    // Basic implementation for SQLite/PG
    const all = await db.select().from(orders).where(and(eq(orders.tenantId, tenantId), eq(orders.status, 'completed')));
    
    // Sort and group by date
    const grouped: Record<string, number> = {};
    all.forEach(o => {
      const date = o.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + parseFloat(o.total as unknown as string);
    });

    return Object.entries(grouped).map(([label, revenue]) => ({ label, revenue })).sort((a,b) => a.label.localeCompare(b.label));
  }

  async getCategorySales(tenantId: string, period: string) {
    const all = await db.select({
      category: products.category,
      total: sql`SUM(${orderItems.lineTotal})`
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(and(eq(orders.tenantId, tenantId), eq(orders.status, 'completed')))
    .groupBy(products.category);

    return all.map(a => ({ name: a.category, value: parseFloat(a.total as string) }));
  }

  async getPaymentMethods(tenantId: string, period: string) {
    const all = await db.select({
      method: orders.paymentMethod,
      total: sql`SUM(orders.total)`
    })
    .from(orders)
    .where(and(eq(orders.tenantId, tenantId), eq(orders.status, 'completed')))
    .groupBy(orders.paymentMethod);

    return all.map(a => ({ name: a.method || 'Other', value: parseFloat(a.total as string) }));
  }
}
