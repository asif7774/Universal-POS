import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { db } from '../db';
import { stores } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  @Get()
  async getSettings(@Request() req: any) {
    const res = await db.select().from(stores).where(and(eq(stores.id, req.user.storeId), eq(stores.tenantId, req.user.tenantId))).limit(1);
    return res[0] || {};
  }

  @Put()
  async updateSettings(@Request() req: any, @Body() body: any) {
    const res = await db.update(stores).set({ ...body, updatedAt: new Date() }).where(and(eq(stores.id, req.user.storeId), eq(stores.tenantId, req.user.tenantId))).returning();
    return res[0];
  }
}
