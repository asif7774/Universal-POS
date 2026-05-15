import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  @Get()
  findAll(@Request() req: any, @Query('limit') limit = '50', @Query('offset') offset = '0') {
    return this.svc.findAll(req.user.tenantId, +limit, +offset);
  }

  @Get('summary')
  summary(@Request() req: any, @Query('date') date?: string) {
    return this.svc.getDailySummary(req.user.tenantId, date ?? new Date().toISOString().split('T')[0]);
  }

  @Get('recent')
  findRecent(@Request() req: any, @Query('limit') limit = '5') {
    return this.svc.findRecent(req.user.tenantId, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.svc.findById(id, req.user.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.svc.create(req.user.tenantId, req.user.storeId, req.user.id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Request() req: any, @Body() body: { status: any }) {
    return this.svc.updateStatus(id, req.user.tenantId, body.status);
  }
}
