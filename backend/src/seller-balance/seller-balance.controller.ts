import {
  Controller,
  Get,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SellerBalanceService } from './seller-balance.service';

@Controller('seller/balance')
@UseGuards(JwtAuthGuard)
export class SellerBalanceController {
  constructor(private readonly sellerBalanceService: SellerBalanceService) {}

  @Get()
  async getMyBalance(@Req() req: { user: { userId: string; role: string } }) {
    if (req.user.role !== 'SELLER') {
      throw new ForbiddenException('Доступ только для Seller');
    }

    return this.sellerBalanceService.getSellerBalance(req.user.userId);
  }
}