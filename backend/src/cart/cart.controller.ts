import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: { user: { userId: string } }) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post()
  add(@Req() req: { user: { userId: string } }, @Body() dto: AddToCartDto) {
    return this.cartService.add(req.user.userId, dto);
  }

  @Delete(':itemId')
  remove(@Req() req: { user: { userId: string } }, @Param('itemId') itemId: string) {
    return this.cartService.remove(req.user.userId, itemId);
  }

  @Delete()
  clear(@Req() req: { user: { userId: string } }) {
    return this.cartService.clear(req.user.userId);
  }
}