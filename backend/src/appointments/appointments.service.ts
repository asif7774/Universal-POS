import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { appointments, customers, users } from '../db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

@Injectable()
export class AppointmentsService {
  async findAll(tenantId: string) {
    const records = await db
      .select({
        id: appointments.id,
        type: appointments.type,
        status: appointments.status,
        date: appointments.date,
        startTime: appointments.startTime,
        duration: appointments.duration,
        notes: appointments.notes,
        customerName: customers.firstName, // We will concat in mapping
        customerLastName: customers.lastName,
        customerPhone: customers.phone,
        assignedToName: users.name,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(users, eq(appointments.assignedTo, users.id))
      .where(eq(appointments.tenantId, tenantId))
      .orderBy(asc(appointments.date), asc(appointments.startTime));

    return records.map(r => ({
      id: r.id,
      customer: r.customerName ? `${r.customerName} ${r.customerLastName || ''}`.trim() : 'Unknown Customer',
      phone: r.customerPhone,
      type: r.type,
      status: r.status === 'scheduled' ? 'Scheduled' : 
              r.status === 'confirmed' ? 'Confirmed' : 
              r.status === 'completed' ? 'Completed' : 
              r.status === 'cancelled' ? 'Cancelled' : 
              r.status === 'no-show' ? 'No-Show' : r.status,
      date: r.date,
      time: r.startTime,
      duration: r.duration,
      assignedTo: r.assignedToName,
      notes: r.notes,
    }));
  }

  async create(tenantId: string, storeId: string, data: any) {
    // Resolve staff UUID from display name
    let assignedToId: string | null = null;
    if (data.assignedTo) {
      const hit = await db.select({ id: users.id })
        .from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.name, data.assignedTo)))
        .limit(1);
      assignedToId = hit[0]?.id ?? null;
    }

    // Best-effort customer UUID match by first name
    let customerId: string | null = null;
    if (data.customer) {
      const firstName = data.customer.trim().split(' ')[0];
      const hit = await db.select({ id: customers.id })
        .from(customers)
        .where(and(eq(customers.tenantId, tenantId), eq(customers.firstName, firstName)))
        .limit(1);
      customerId = hit[0]?.id ?? null;
    }

    const res = await db.insert(appointments).values({
      tenantId,
      storeId: storeId ?? null,
      customerId,
      assignedTo: assignedToId,
      type: data.type,
      status: 'scheduled',
      date: data.date,
      startTime: data.time,       // form sends 'time'; DB column is 'startTime'
      duration: data.duration ?? 30,
      notes: data.notes ?? null,
    }).returning();
    return res[0];
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    const res = await db.update(appointments)
      .set({ status: status.toLowerCase() })
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)))
      .returning();

    if (!res[0]) throw new NotFoundException(`Appointment ${id} not found`);
    return res[0];
  }

  async getCount(tenantId: string, date: string) {
    const res = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(eq(appointments.tenantId, tenantId), eq(appointments.date, date)));
    return res[0]?.count || 0;
  }
}
