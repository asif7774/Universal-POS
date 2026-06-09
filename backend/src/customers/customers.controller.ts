import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly svc: CustomersService) { }

  @Get()
  findAll(@Request() req: any, @Query('search') search?: string) {
    return this.svc.findAll(req.user.tenantId, search);
  }

  @Get('measurements/all')
  getAllMeasurements(@Request() req: any) {
    return this.svc.getAllMeasurements(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.svc.findById(id, req.user.tenantId);
  }

  @Get(':id/measurements')
  getMeasurements(@Param('id') id: string, @Request() req: any) {
    return this.svc.getMeasurements(id, req.user.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.svc.create(req.user.tenantId, req.user.storeId, body);
  }

  @Post(':id/measurements')
  saveMeasurement(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.svc.saveMeasurement(id, req.user.tenantId, req.user.id, body);
  }

  @Put(':id/measurements/:mid')
  updateMeasurement(@Param('id') id: string, @Param('mid') mid: string, @Request() req: any, @Body() body: any) {
    return this.svc.updateMeasurement(mid, id, req.user.tenantId, body);
  }

  @Delete(':id/measurements/:mid')
  deleteMeasurement(@Param('id') id: string, @Param('mid') mid: string, @Request() req: any) {
    return this.svc.deleteMeasurement(mid, id, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.svc.update(id, req.user.tenantId, body);
  }

  @Post(':id/loyalty')
  addLoyalty(@Param('id') id: string, @Request() req: any, @Body() body: { points: number }) {
    return this.svc.addLoyaltyPoints(id, req.user.tenantId, body.points);
  }
}
