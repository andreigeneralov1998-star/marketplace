import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return { items, total };
  }

  async add(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || !product.isPublished) throw new NotFoundException('Product not found');
    if (product.stock < dto.quantity) throw new BadRequestException('Not enough stock');

    await this.prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
      update: {
        quantity: { increment: dto.quantity },
      },
      create: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });

    return this.getCart(userId);
  }

  async remove(userId: string, itemId: string) {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clear(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { success: true };
  }
}