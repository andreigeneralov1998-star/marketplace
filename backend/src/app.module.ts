import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { StoresModule } from './stores/stores.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadsModule } from './uploads/uploads.module';
import { CartModule } from './cart/cart.module';
import { SellerBalanceModule } from './seller-balance/seller-balance.module';
import { SellerWithdrawalsModule } from './seller-withdrawals/seller-withdrawals.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    SellerBalanceModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    StoresModule,
    CategoriesModule,
    UploadsModule,
    UsersModule,
    CartModule,
    SellerWithdrawalsModule,
  ],
})
export class AppModule {}