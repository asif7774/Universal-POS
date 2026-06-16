import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { products, inventory } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class InventoryService {
  async getInventory(tenantId: string) {
    const prods = await db.select().from(products).where(eq(products.tenantId, tenantId));
    const invs = await db.select().from(inventory).where(eq(inventory.tenantId, tenantId));
    
    return prods.map(p => {
      const sizes: Record<string, any> = {};
      const productInvs = invs.filter(i => i.productId === p.id);
      
      let loc = 'Storage';
      
      productInvs.forEach(inv => {
        sizes[inv.size] = {
          total: inv.totalQty,
          available: inv.availableQty,
          out: inv.rentedQty,
          cleaning: inv.cleaningQty
        };
        if (inv.location) loc = inv.location;
      });

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        type: p.type,
        sizes,
        rentalRate: p.rentalRatePerDay ? Number(p.rentalRatePerDay) : undefined,
        salePrice: p.salePrice ? Number(p.salePrice) : undefined,
        lowStockThreshold: 2,
        location: loc,
        condition: 'Excellent'
      };
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const { name, category, salePrice, rentalRate, location } = data;
    
    // Update product info
    const res = await db.update(products)
      .set({
        name,
        category,
        salePrice: salePrice?.toString(),
        rentalRatePerDay: rentalRate?.toString(),
        updatedAt: new Date()
      })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();

    // Update location in inventory table for all sizes of this product
    if (location) {
      await db.update(inventory)
        .set({ location, updatedAt: new Date() })
        .where(and(eq(inventory.productId, id), eq(inventory.tenantId, tenantId)));
    }
      
    return res[0];
  }

  async updateStock(id: string, tenantId: string, storeId: string, sizes: Record<string, any>) {
    for (const [size, data] of Object.entries(sizes)) {
      const existing = await db
        .select({ id: inventory.id })
        .from(inventory)
        .where(and(
          eq(inventory.productId, id),
          eq(inventory.tenantId, tenantId),
          eq(inventory.size, size)
        ))
        .limit(1);

      if (existing.length > 0) {
        await db.update(inventory)
          .set({
            totalQty: data.total,
            availableQty: data.available,
            rentedQty: data.out ?? 0,
            updatedAt: new Date()
          })
          .where(and(
            eq(inventory.productId, id),
            eq(inventory.tenantId, tenantId),
            eq(inventory.size, size)
          ));
      } else {
        await db.insert(inventory).values({
          productId: id,
          tenantId,
          storeId: storeId ?? null,
          size,
          totalQty: data.total ?? 0,
          availableQty: data.available ?? 0,
          rentedQty: data.out ?? 0,
          cleaningQty: 0,
          damagedQty: 0,
        });
      }
    }
    return { success: true };
  }

  async deleteItem(id: string, tenantId: string) {
    await db.delete(products).where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return { success: true };
  }
}
