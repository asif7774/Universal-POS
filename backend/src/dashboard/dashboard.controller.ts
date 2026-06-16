import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { db } from '../db';
import { rentals } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  @Get('time')
  getServerTime() {
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
    };
  }

  @Get('alerts')
  async getAlerts(@Request() req: any) {
    const today = new Date().toISOString().split('T')[0];
    
    // Find overdue rentals
    const overdue = await db.select().from(rentals).where(and(
      eq(rentals.tenantId, req.user.tenantId),
      lt(rentals.returnDate, today),
      eq(rentals.status, 'out')
    ));

    const alerts: Array<{ type: string; msg: string; actionUrl?: string }> = overdue.map(r => ({
      type: 'warning',
      msg: `Rental ${r.rentalNo} is overdue!`,
      actionUrl: `/rentals?search=${r.rentalNo}`
    }));

    return alerts;
  }
}
