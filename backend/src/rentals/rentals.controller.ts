import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { RentalsService } from './rentals.service';

@Controller('rentals')
@UseGuards(JwtAuthGuard)
export class RentalsController {
  constructor(private readonly svc: RentalsService) {}

  @Get()
  findAll(@Request() req: any, @Query('status') status?: string) {
    return this.svc.findAll(req.user.tenantId, status);
  }

  @Get('overdue')
  findOverdue(@Request() req: any) {
    return this.svc.findOverdue(req.user.tenantId);
  }

  @Get('stats')
  stats(@Request() req: any) {
    return this.svc.getStats(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.svc.findById(id, req.user.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.svc.create(req.user.tenantId, body);
  }

  @Patch(':id/checkout')
  checkOut(@Param('id') id: string, @Request() req: any) {
    return this.svc.checkOut(id, req.user.tenantId);
  }

  @Patch(':id/checkin')
  checkIn(@Param('id') id: string, @Request() req: any, @Body() body: { condition: string; damageFee?: number }) {
    return this.svc.checkIn(id, req.user.tenantId, body.condition, body.damageFee ?? 0);
  }
}
