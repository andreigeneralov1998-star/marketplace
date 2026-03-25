import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellerWithdrawalsController } from './seller-withdrawals.controller';
import { SellerWithdrawalsService } from './seller-withdrawals.service';

@Module({
  controllers: [SellerWithdrawalsController],
  providers: [SellerWithdrawalsService, PrismaService],
  exports: [SellerWithdrawalsService],
})
export class SellerWithdrawalsModule {}