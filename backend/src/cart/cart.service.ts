import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                phone: true,
                storeName: true,
                storeSlug: true,
              },
            },
          },
        },
      },
    });

    const total = items.reduce((sum, item) => {
      return sum + Number(item.product?.price ?? 0) * item.quantity;
    }, 0);

    return {
      items,
      total,
    };
  }

  async addToCart(userId: string, productId: string, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException('Количество должно быть целым числом больше 0');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isPublished) {
      throw new NotFoundException('Товар не найден');
    }

    if (product.stock < 1) {
      throw new BadRequestException('Товара нет в наличии');
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      const nextQuantity = existing.quantity + quantity;

      if (nextQuantity > product.stock) {
        throw new BadRequestException(
          `Недостаточно товара на складе. Доступно: ${product.stock}`,
        );
      }

      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: nextQuantity,
        },
        include: {
          product: {
            include: {
              images: { orderBy: { position: 'asc' } },
              category: true,
              seller: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                  storeName: true,
                  storeSlug: true,
                },
              },
            },
          },
        },
      });
    }

    if (quantity > product.stock) {
      throw new BadRequestException(
        `Недостаточно товара на складе. Доступно: ${product.stock}`,
      );
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: {
        product: {
          include: {
            images: { orderBy: { position: 'asc' } },
            category: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                username: true,
                storeName: true,
                storeSlug: true,
              },
            },
          },
        },
      },
    });
  }

  async updateQuantity(userId: string, cartItemId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException('Количество должно быть целым числом больше 0');
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: true,
      },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Позиция корзины не найдена');
    }

    if (!cartItem.product.isPublished) {
      throw new BadRequestException('Товар больше недоступен');
    }

    if (quantity > cartItem.product.stock) {
      throw new BadRequestException(
        `Недостаточно товара на складе. Доступно: ${cartItem.product.stock}`,
      );
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { orderBy: { position: 'asc' } },
            category: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                username: true,
                storeName: true,
                storeSlug: true,
              },
            },
          },
        },
      },
    });
  }

  async removeItem(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Позиция корзины не найдена');
    }

    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }
}