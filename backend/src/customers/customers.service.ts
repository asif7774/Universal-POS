import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { customers, measurements } from '../db/schema';
import { eq, and, or, ilike, sql } from 'drizzle-orm';

export interface Customer {
  id: string;
  tenantId: string;
  storeId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  tags: any;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: string | null;
  lastVisitAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Measurement {
  id: string;
  customerId: string;
  tenantId: string;
  takenById: string | null;
  jacketSize: string | null;
  chest: string | null; waist: string | null; hips: string | null;
  inseam: string | null; outseam: string | null; neck: string | null;
  sleeve: string | null; shoulder: string | null; shoeSize: string | null;
  height: string | null; weight: string | null;
  notes: string | null; fittingNotes: string | null;
  createdAt: Date;
}

@Injectable()
export class CustomersService {
  async findAll(tenantId: string, search?: string): Promise<Customer[]> {
    if (search) {
      const q = `%${search}%`;
      const res = await db.select().from(customers).where(
        and(
          eq(customers.tenantId, tenantId),
          or(
            ilike(customers.firstName, q),
            ilike(customers.lastName, q),
            ilike(customers.email, q),
            ilike(customers.phone, q)
          )
        )
      );
      return res as unknown as Customer[];
    }
    const res = await db.select().from(customers).where(eq(customers.tenantId, tenantId));
    return res as unknown as Customer[];
  }

  async findById(id: string, tenantId: string): Promise<Customer> {
    const res = await db.select().from(customers).where(and(eq(customers.id, id), eq(customers.tenantId, tenantId))).limit(1);
    if (!res[0]) throw new NotFoundException(`Customer ${id} not found`);
    return res[0] as unknown as Customer;
  }

  async getMeasurements(customerId: string, tenantId: string): Promise<Measurement[]> {
    const res = await db.select().from(measurements).where(and(eq(measurements.customerId, customerId), eq(measurements.tenantId, tenantId)));
    return res as unknown as Measurement[];
  }

  async create(tenantId: string, storeId: string, data: Partial<Customer>): Promise<Customer> {
    const res = await db.insert(customers).values({
      tenantId,
      storeId,
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      tags: data.tags ?? [],
    }).returning();
    return res[0] as unknown as Customer;
  }

  async saveMeasurement(customerId: string, tenantId: string, takenById: string, data: Partial<Measurement>): Promise<Measurement> {
    // Upsert isn't directly supported identically without a unique constraint on customerId, 
    // so we delete existing first to keep 1 active measurement profile per customer.
    await db.delete(measurements).where(and(eq(measurements.customerId, customerId), eq(measurements.tenantId, tenantId)));
    
    const res = await db.insert(measurements).values({
      customerId,
      tenantId,
      takenById,
      ...data,
    }).returning();
    return res[0] as unknown as Measurement;
  }

  async update(id: string, tenantId: string, data: Partial<Customer>): Promise<Customer> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (updateData.totalSpent === null) delete updateData.totalSpent;
    const res = await db.update(customers).set(updateData).where(and(eq(customers.id, id), eq(customers.tenantId, tenantId))).returning();
    if (!res[0]) throw new NotFoundException(`Customer ${id} not found`);
    return res[0] as unknown as Customer;
  }

  async addLoyaltyPoints(id: string, tenantId: string, points: number): Promise<Customer> {
    const res = await db.update(customers)
      .set({ loyaltyPoints: sql`${customers.loyaltyPoints} + ${points}`, updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
      .returning();
    if (!res[0]) throw new NotFoundException();
    return res[0] as unknown as Customer;
  }
}
