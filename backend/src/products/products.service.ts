import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { products } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export type ProductType = 'rental' | 'sale' | 'service';

export interface Product {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string | null;
  type: string;
  category: string;
  salePrice?: string | null;
  rentalRatePerDay?: string | null;
  taxable: boolean;
  isActive: boolean;
  trackInventory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductsService {
  async findAll(tenantId: string, category?: string): Promise<Product[]> {
    const conditions = category
      ? and(eq(products.tenantId, tenantId), eq(products.isActive, true), eq(products.category, category))
      : and(eq(products.tenantId, tenantId), eq(products.isActive, true));
    
    return db.select().from(products).where(conditions) as unknown as Promise<Product[]>;
  }

  async findById(id: string, tenantId: string): Promise<Product | undefined> {
    const res = await db.select().from(products).where(and(eq(products.id, id), eq(products.tenantId, tenantId))).limit(1);
    return res[0] as unknown as Product;
  }

  async findBySku(sku: string, tenantId: string): Promise<Product | undefined> {
    const res = await db.select().from(products).where(and(eq(products.sku, sku), eq(products.tenantId, tenantId))).limit(1);
    return res[0] as unknown as Product;
  }

  async getCategories(tenantId: string): Promise<string[]> {
    const res = await db.selectDistinct({ category: products.category }).from(products).where(eq(products.tenantId, tenantId));
    return res.map(r => r.category);
  }

  async create(data: any): Promise<Product> {
    const res = await db.insert(products).values(data).returning();
    return res[0] as unknown as Product;
  }

  async update(id: string, tenantId: string, data: any): Promise<Product | undefined> {
    const res = await db.update(products).set({ ...data, updatedAt: new Date() }).where(and(eq(products.id, id), eq(products.tenantId, tenantId))).returning();
    return res[0] as unknown as Product;
  }

  async deactivate(id: string, tenantId: string): Promise<boolean> {
    const res = await db.update(products).set({ isActive: false }).where(and(eq(products.id, id), eq(products.tenantId, tenantId))).returning();
    return res.length > 0;
  }
}
