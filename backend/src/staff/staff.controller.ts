import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  @Get()
  async getStaff(@Request() req: any) {
    return db.select().from(users).where(and(eq(users.tenantId, req.user.tenantId), eq(users.storeId, req.user.storeId)));
  }

  @Post()
  async createStaff(@Request() req: any, @Body() body: any) {
    const [res] = await db.insert(users).values({
      ...body,
      tenantId: req.user.tenantId,
      storeId: req.user.storeId,
      passwordHash: 'pass', // Default password for new staff
    }).returning();
    return res;
  }

  @Put(':id')
  async updateStaff(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    const [res] = await db.update(users).set({ ...body, updatedAt: new Date() }).where(and(eq(users.id, id), eq(users.tenantId, req.user.tenantId))).returning();
    return res;
  }
}
