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

  async create(tenantId: string, data: any) {
    const res = await db.insert(appointments).values({
      ...data,
      tenantId,
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
