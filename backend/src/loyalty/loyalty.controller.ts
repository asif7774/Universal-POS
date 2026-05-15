import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { db } from '../db';
import { customers } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  @Post('redeem')
  async redeem(@Request() req: any, @Body() body: { customerId: string; points: number }) {
    const [res] = await db.update(customers)
      .set({ 
        loyaltyPoints: sql`${customers.loyaltyPoints} - ${body.points}`,
        updatedAt: new Date() 
      })
      .where(and(eq(customers.id, body.customerId), eq(customers.tenantId, req.user.tenantId)))
      .returning();
    return res;
  }
}
