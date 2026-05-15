import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { db } from '../db';
import { returns, returnItems } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  @Get()
  async findAll(@Request() req: any) {
    const res = await db.select().from(returns).where(eq(returns.tenantId, req.user.tenantId)).orderBy(desc(returns.createdAt));
    return res;
  }

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    const { items, ...data } = body;
    const [ret] = await db.insert(returns).values({
      ...data,
      tenantId: req.user.tenantId,
    }).returning();

    if (items && items.length > 0) {
      await db.insert(returnItems).values(items.map((i: any) => ({ ...i, returnId: ret.id })));
    }

    return ret;
  }
}
