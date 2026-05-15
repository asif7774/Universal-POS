import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('revenue')
  revenue(@Request() req: any, @Query('period') period = 'week') {
    return this.svc.getRevenue(req.user.tenantId, period);
  }

  @Get('category-sales')
  categorySales(@Request() req: any, @Query('period') period = 'week') {
    return this.svc.getCategorySales(req.user.tenantId, period);
  }

  @Get('payment-methods')
  paymentMethods(@Request() req: any, @Query('period') period = 'week') {
    return this.svc.getPaymentMethods(req.user.tenantId, period);
  }
}
