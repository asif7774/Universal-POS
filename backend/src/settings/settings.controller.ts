import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { db } from '../db';
import { stores, tenants } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  @Get()
  async getSettings(@Request() req: any) {
    const res = await db
      .select({
        id: stores.id,
        name: stores.name,
        address: stores.address,
        city: stores.city,
        state: stores.state,
        zip: stores.zip,
        phone: stores.phone,
        taxRate: tenants.taxRate,
        currency: tenants.currency,
        timezone: tenants.timezone,
        // lateFeePerDay: tenants.lateFeePerDay,
        // depositPct: tenants.depositPct,
        // rentalBuffer: tenants.rentalBuffer,
      })
      .from(stores)
      .innerJoin(tenants, eq(stores.tenantId, tenants.id))
      .where(and(eq(stores.id, req.user.storeId), eq(stores.tenantId, req.user.tenantId)))
      .limit(1);
    
    const config = res[0] || {};
    
    return {
      ...config,
      lateFeePerDay: (config as any).lateFeePerDay || '5.00',
      depositPct: (config as any).depositPct || '0.50',
      rentalBuffer: (config as any).rentalBuffer || 1,
    };
  }

  @Put()
  async updateSettings(@Request() req: any, @Body() body: any) {
    const { 
      id, tenantId, createdAt, isActive, 
      taxRate, currency, timezone, lateFeePerDay, depositPct, rentalBuffer,
      ...storeData 
    } = body;
    
    // Update Store
    const [storeRes] = await db.update(stores)
      .set(storeData)
      .where(and(eq(stores.id, req.user.storeId), eq(stores.tenantId, req.user.tenantId)))
      .returning();

    // Update Tenant (global settings)
    const tenantUpdate: any = {};
    if (taxRate !== undefined) tenantUpdate.taxRate = taxRate;
    if (currency !== undefined) tenantUpdate.currency = currency;
    if (timezone !== undefined) tenantUpdate.timezone = timezone;
    // Note: lateFeePerDay, depositPct, rentalBuffer, and updatedAt are excluded 
    // for now as they require a database migration that hasn't been run yet.

    if (Object.keys(tenantUpdate).length > 0) {
      await db.update(tenants)
        .set(tenantUpdate)
        .where(eq(tenants.id, req.user.tenantId));
    }

    return {
      ...storeRes,
      ...tenantUpdate,
      // Fallbacks for columns that might not exist in DB yet
      lateFeePerDay: tenantUpdate.lateFeePerDay || '5.00',
      depositPct: tenantUpdate.depositPct || '0.50',
      rentalBuffer: tenantUpdate.rentalBuffer || 1,
    };
  }
}
