import { Module } from '@nestjs/common';
import { SellerBalanceService } from './seller-balance.service';
import { SellerBalanceController } from './seller-balance.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SellerBalanceController],
  providers: [SellerBalanceService, PrismaService],
  exports: [SellerBalanceService],
})
export class SellerBalanceModule {}