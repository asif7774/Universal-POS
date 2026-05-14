import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { tailoringJobs, customers, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

const generateJobNo = () => `JOB-${Date.now().toString().slice(-4)}`;

@Injectable()
export class TailoringService {
  async findAll(tenantId: string) {
    const res = await db.select({
      id: tailoringJobs.id,
      jobNo: tailoringJobs.jobNo,
      type: tailoringJobs.type,
      status: tailoringJobs.status,
      garment: tailoringJobs.garment,
      description: tailoringJobs.description,
      notes: tailoringJobs.notes,
      price: tailoringJobs.price,
      dueDate: tailoringJobs.dueDate,
      customer: {
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
      },
      assignee: {
        name: users.name,
      }
    })
    .from(tailoringJobs)
    .leftJoin(customers, eq(tailoringJobs.customerId, customers.id))
    .leftJoin(users, eq(tailoringJobs.assignedTo, users.id))
    .where(eq(tailoringJobs.tenantId, tenantId))
    .orderBy(desc(tailoringJobs.createdAt));

    return res.map(row => ({
      ...row,
      customerName: row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : 'Unknown',
      phone: row.customer?.phone || '',
      assignedToName: row.assignee?.name || 'Unassigned',
      price: parseFloat(row.price as unknown as string),
    }));
  }

  async findById(id: string, tenantId: string) {
    const res = await db.select().from(tailoringJobs).where(and(eq(tailoringJobs.id, id), eq(tailoringJobs.tenantId, tenantId))).limit(1);
    if (!res[0]) throw new NotFoundException(`Tailoring Job ${id} not found`);
    return res[0];
  }

  async create(tenantId: string, data: any) {
    const [job] = await db.insert(tailoringJobs).values({
      tenantId,
      jobNo: generateJobNo(),
      customerId: data.customerId,
      assignedTo: data.assignedTo,
      orderId: data.orderId,
      type: data.type,
      garment: data.garment,
      description: data.description,
      notes: data.notes,
      price: data.price ? data.price.toString() : '0.00',
      dueDate: data.dueDate,
    }).returning();
    return job;
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    const payload: any = { status, updatedAt: new Date() };
    if (status === 'Delivered') {
      payload.completedAt = new Date();
    }
    const [res] = await db.update(tailoringJobs)
      .set(payload)
      .where(and(eq(tailoringJobs.id, id), eq(tailoringJobs.tenantId, tenantId)))
      .returning();
      
    if (!res) throw new NotFoundException();
    return res;
  }
}
