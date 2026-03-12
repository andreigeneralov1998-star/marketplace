import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user.userId, dto);
  }

  @Get('my')
  myOrders(@Req() req: { user: { userId: string } }) {
    return this.ordersService.buyerOrders(req.user.userId);
  }

  @Get('my-history')
  myHistory(@Req() req: { user: { userId: string } }) {
    return this.ordersService.myHistory(req.user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('SELLER')
  @Get('seller/my')
  sellerOrders(@Req() req: { user: { userId: string } }) {
    return this.ordersService.sellerOrders(req.user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('SELLER')
  @Get('seller/:orderId')
  sellerOrderById(
    @Req() req: { user: { userId: string } },
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.sellerOrderById(req.user.userId, orderId);
  }

  @UseGuards(RolesGuard)
  @Roles('SELLER')
  @Patch('seller/items/:itemId/status')
  updateSellerItemStatus(
    @Req() req: { user: { userId: string } },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateSellerItemStatus(
      req.user.userId,
      itemId,
      dto.status,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  allOrders() {
    return this.ordersService.allOrders();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  orderById(@Param('id') id: string) {
    return this.ordersService.orderById(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}