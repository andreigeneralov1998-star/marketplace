import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.findMyCart(req.user.userId);
  }

  @Post()
  addToCart(
    @Req() req: any,
    @Body() body: { productId: string; quantity: number },
  ) {
    return this.cartService.addToCart(
      req.user.userId,
      body.productId,
      body.quantity || 1,
    );
  }

  @Patch(':id')
  updateQuantity(
    @Req() req: any,
    @Param('id') cartItemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(
      req.user.userId,
      cartItemId,
      body.quantity,
    );
  }

  @Delete(':id')
  removeItem(@Req() req: any, @Param('id') cartItemId: string) {
    return this.cartService.removeItem(req.user.userId, cartItemId);
  }
}