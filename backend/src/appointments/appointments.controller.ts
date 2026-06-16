import { Controller, Get, Post, Put, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../common/guards';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.appointmentsService.findAll(req.user.tenantId);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.appointmentsService.create(req.user.tenantId, req.user.storeId, body);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.appointmentsService.updateStatus(id, req.user.tenantId, body.status);
  }

  @Get('count')
  async getCount(@Req() req: any, @Query('date') date: string) {
    const count = await this.appointmentsService.getCount(req.user.tenantId, date);
    return { count };
  }
}
