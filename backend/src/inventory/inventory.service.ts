import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { products, inventory } from '../db/schema';
import { eq } from 'drizzle-orm';

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
}
