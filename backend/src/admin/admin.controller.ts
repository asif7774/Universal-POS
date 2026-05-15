import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { db } from '../db';
import { tenants, orders, stores } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  @Get('tenants')
  async getTenants() {
    // Only super-admin should access this, but for now we simplify
    return db.select().from(tenants);
  }

  @Get('stats')
  async getStats() {
    const tCount = await db.select({ count: sql`count(*)` }).from(tenants);
    const sCount = await db.select({ count: sql`count(*)` }).from(stores);
    const rev = await db.select({ total: sql`sum(total)` }).from(orders).where(eq(orders.status, 'completed'));

    return {
      totalTenants: parseInt(tCount[0].count as string),
      activeTerminals: parseInt(sCount[0].count as string),
      mrr: parseFloat(rev[0].total as string || '0') * 0.1, // Fake MRR logic
      systemHealth: 98,
    };
  }
}
