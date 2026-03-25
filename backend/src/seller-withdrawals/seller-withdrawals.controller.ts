import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SellerWithdrawalsService } from './seller-withdrawals.service';
import { CreateTopsetBalanceWithdrawalDto } from './dto/create-topset-balance-withdrawal.dto';
import { CreateTopsetCashWithdrawalDto } from './dto/create-topset-cash-withdrawal.dto';

@Controller('seller/withdrawals')
@UseGuards(JwtAuthGuard)
export class SellerWithdrawalsController {
  constructor(
    private readonly sellerWithdrawalsService: SellerWithdrawalsService,
  ) {}

  @Post('topset-balance')
  createTopsetBalance(
    @Req() req: { user: { userId: string; role: string } },
    @Body() dto: CreateTopsetBalanceWithdrawalDto,
  ) {
    if (req.user.role !== 'SELLER') {
      throw new ForbiddenException('Доступ только для Seller');
    }

    return this.sellerWithdrawalsService.createTopsetBalanceRequest(
      req.user.userId,
      dto,
    );
  }

  @Post('topset-cash')
  createTopsetCash(
    @Req() req: { user: { userId: string; role: string } },
    @Body() dto: CreateTopsetCashWithdrawalDto,
  ) {
    if (req.user.role !== 'SELLER') {
      throw new ForbiddenException('Доступ только для Seller');
    }

    return this.sellerWithdrawalsService.createTopsetCashRequest(
      req.user.userId,
      dto,
    );
  }

  @Get('my')
  findMy(@Req() req: { user: { userId: string; role: string } }) {
    if (req.user.role !== 'SELLER') {
      throw new ForbiddenException('Доступ только для Seller');
    }

    return this.sellerWithdrawalsService.findMyRequests(req.user.userId);
  }
}