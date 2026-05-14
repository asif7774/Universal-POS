import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { TailoringService } from './tailoring.service';
import { JwtAuthGuard } from '../common/guards';

@UseGuards(JwtAuthGuard)
@Controller('tailoring')
export class TailoringController {
  constructor(private readonly tailoringService: TailoringService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.tailoringService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.tailoringService.findById(id, req.user.tenantId);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.tailoringService.create(req.user.tenantId, body);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.tailoringService.updateStatus(id, req.user.tenantId, body.status);
  }
}

