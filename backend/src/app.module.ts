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
  ],
})
export class AppModule {}
