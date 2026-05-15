import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { rentals, rentalItems, customers } from '../db/schema';
import { eq, and, sql, asc } from 'drizzle-orm';

export interface RentalItem {
  id: string;
  rentalId: string;
  productId?: string | null;
  productName: string;
  size?: string | null;
  barcode?: string | null;
  checkedOutAt?: Date | null;
  checkedInAt?: Date | null;
  condition: string | null;
  notes?: string | null;
}

export interface Rental {
  id: string;
  tenantId: string;
  orderId?: string | null;
  customerId: string;
  rentalNo: string;
  status: string;
  eventName?: string | null;
  eventDate?: string | null;
  pickupDate: string;
  returnDate: string;
  actualReturnAt?: Date | null;
  depositPaid: string | null;
  depositReturned: string | null;
  lateFeeCharged: string | null;
  damageFee: string | null;
  notes?: string | null;
  items?: RentalItem[];
  createdAt: Date;
  updatedAt: Date;
}

const generateRentalNo = () => `RNT-${Date.now().toString().slice(-4)}`;

const getDaysOverdue = (returnDate: string) => {
  const diff = Math.floor((Date.now() - new Date(returnDate).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
};

@Injectable()
export class RentalsService {
  async findAll(tenantId: string, status?: string): Promise<Rental[]> {
    const conditions = status ? and(eq(rentals.tenantId, tenantId), eq(rentals.status, status)) : eq(rentals.tenantId, tenantId);
    const res = await db.select({
      rental: rentals,
      customer: {
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
        email: customers.email,
      }
    })
    .from(rentals)
    .leftJoin(customers, eq(rentals.customerId, customers.id))
    .where(conditions)
    .orderBy(rentals.returnDate);
    
    return res.map(row => ({ ...row.rental, customer: row.customer })) as unknown as Rental[];
  }

  async findById(id: string, tenantId: string): Promise<Rental> {
    const res = await db.select({
      rental: rentals,
      customer: {
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
        email: customers.email,
      }
    })
    .from(rentals)
    .leftJoin(customers, eq(rentals.customerId, customers.id))
    .where(and(eq(rentals.id, id), eq(rentals.tenantId, tenantId)))
    .limit(1);

    if (!res[0]) throw new NotFoundException(`Rental ${id} not found`);
    const itemsRes = await db.select().from(rentalItems).where(eq(rentalItems.rentalId, id));
    return { ...res[0].rental, customer: res[0].customer, items: itemsRes } as unknown as Rental;
  }

  async findByCustomer(customerId: string, tenantId: string): Promise<Rental[]> {
    const res = await db.select().from(rentals).where(and(eq(rentals.customerId, customerId), eq(rentals.tenantId, tenantId)));
    return res as unknown as Rental[];
  }

  async findOverdue(tenantId: string): Promise<Array<Rental & { daysOverdue: number }>> {
    const today = new Date().toISOString().split('T')[0];
    const res = await db.select({
      rental: rentals,
      customer: {
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
        email: customers.email,
      }
    })
    .from(rentals)
    .leftJoin(customers, eq(rentals.customerId, customers.id))
    .where(and(eq(rentals.tenantId, tenantId), eq(rentals.status, 'out')));

    return res
      .filter(row => row.rental.returnDate < today)
      .map(row => ({ 
        ...row.rental, 
        customer: row.customer, 
        daysOverdue: getDaysOverdue(row.rental.returnDate) 
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue) as unknown as Array<Rental & { daysOverdue: number }>;
  }

  async create(tenantId: string, data: any): Promise<Rental> {
    const { items, ...rentalData } = data;
    const [rental] = await db.insert(rentals).values({
      tenantId,
      rentalNo: generateRentalNo(),
      ...rentalData
    }).returning();

    if (items && items.length > 0) {
      await db.insert(rentalItems).values(items.map((i: any) => ({ ...i, rentalId: rental.id })));
    }
    return { ...rental, items } as unknown as Rental;
  }

  async checkOut(id: string, tenantId: string): Promise<Rental> {
    const [res] = await db.update(rentals).set({ status: 'out', updatedAt: new Date() }).where(and(eq(rentals.id, id), eq(rentals.tenantId, tenantId))).returning();
    if (!res) throw new NotFoundException();
    await db.update(rentalItems).set({ checkedOutAt: new Date() }).where(eq(rentalItems.rentalId, id));
    return this.findById(id, tenantId);
  }

  async checkIn(id: string, tenantId: string, condition: string, damageFee = 0): Promise<Rental> {
    const r = await this.findById(id, tenantId);
    const daysOverdue = getDaysOverdue(r.returnDate);
    const lateFee = daysOverdue * 25; // $25/day late fee
    const depReturned = Math.max(0, parseFloat(r.depositPaid as unknown as string) - lateFee - damageFee);

    await db.update(rentals).set({
      status: 'returned', actualReturnAt: new Date(),
      lateFeeCharged: lateFee.toString(), damageFee: damageFee.toString(),
      depositReturned: depReturned.toString(),
      updatedAt: new Date()
    }).where(and(eq(rentals.id, id), eq(rentals.tenantId, tenantId)));

    await db.update(rentalItems).set({ checkedInAt: new Date(), condition }).where(eq(rentalItems.rentalId, id));
    return this.findById(id, tenantId);
  }

  async getStats(tenantId: string) {
    const all = await db.select({ status: rentals.status }).from(rentals).where(eq(rentals.tenantId, tenantId));
    return {
      total: all.length,
      booked: all.filter(r => r.status === 'booked').length,
      out: all.filter(r => r.status === 'out').length,
      overdue: (await this.findOverdue(tenantId)).length,
      returned: all.filter(r => r.status === 'returned').length,
    };
  }

  async findUpcoming(tenantId: string, limit = 5): Promise<Rental[]> {
    const res = await db.select({
      rental: rentals,
      customer: {
        firstName: customers.firstName,
        lastName: customers.lastName,
      }
    })
    .from(rentals)
    .leftJoin(customers, eq(rentals.customerId, customers.id))
    .where(and(eq(rentals.tenantId, tenantId), eq(rentals.status, 'booked')))
    .orderBy(asc(rentals.pickupDate))
    .limit(limit);

    return res.map(row => ({ 
      ...row.rental, 
      customer: row.customer 
    })) as any;
  }
}
