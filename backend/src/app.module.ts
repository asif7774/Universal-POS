import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { RentalsModule } from './rentals/rentals.module';
import { InventoryModule } from './inventory/inventory.module';
import { TailoringModule } from './tailoring/tailoring.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { StaffModule } from './staff/staff.module';
import { ReturnsModule } from './returns/returns.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
    RentalsModule,
    InventoryModule,
    TailoringModule,
    AppointmentsModule,
    ReportsModule,
    SettingsModule,
    StaffModule,
    ReturnsModule,
    LoyaltyModule,
    DashboardModule,
    AdminModule,
  ],
})
export class AppModule {}
