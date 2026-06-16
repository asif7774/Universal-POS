import { Controller, Get, Put, Post, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Get()
  async getInventory(@Req() req: any) {
    return this.svc.getInventory(req.user.tenantId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.svc.update(id, req.user.tenantId, body);
  }

  @Put(':id/stock')
  async updateStock(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.svc.updateStock(id, req.user.tenantId, req.user.storeId, body.sizes);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.svc.deleteItem(id, req.user.tenantId);
  }
}
