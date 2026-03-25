import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(
    @Req() req: { user: { userId: string } },
    @Body() dto: CheckoutDto,
  ) {
    return this.ordersService.checkout(req.user.userId, dto);
  }

  @Get('my')
  myOrders(
    @Req() req: { user: { userId: string } },
    @Query() query: QueryOrdersDto,
  ) {
    return this.ordersService.findMyOrders(req.user.userId, query);
  }

  @Get('my/:id')
  myOrderById(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.ordersService.findMyOrderById(req.user.userId, id);
  }

  @Get('seller/my')
  sellerOrders(
    @Req() req: { user: { userId: string } },
    @Query() query: QueryOrdersDto,
  ) {
    return this.ordersService.findSellerOrders(req.user.userId, query);
  }

  @Get('seller/:id')
  sellerOrderById(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.ordersService.findSellerOrderById(req.user.userId, id);
  }

  @Patch('seller/items/:itemId/status')
  updateSellerItemStatus(
    @Req() req: { user: { userId: string } },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateSellerOrderItemStatus(
      req.user.userId,
      itemId,
      dto,
    );
  }
}