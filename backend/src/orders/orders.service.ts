import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SellerBalanceService } from '../seller-balance/seller-balance.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sellerBalanceService: SellerBalanceService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!cartItems.length) {
      throw new BadRequestException('Корзина пуста');
    }

    for (const item of cartItems) {
      if (!item.product || !item.product.isPublished) {
        throw new BadRequestException(
          `Товар "${item.product?.title ?? 'Без названия'}" больше недоступен`,
        );
      }

      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Недостаточно товара "${item.product.title}" на складе. Доступно: ${item.product.stock}`,
        );
      }
    }

    const sellerIds = [...new Set(cartItems.map((item) => item.product.sellerId))];

    if (sellerIds.length > 1) {
      throw new BadRequestException(
        'Нельзя оформить один заказ на товары разных продавцов',
      );
    }

    const total = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const order = await this.prisma.$transaction(async (tx) => {
      const lastOrder = await tx.order.findFirst({
        where: {
          orderNumber: { not: null },
        },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });

      const nextOrderNumber = lastOrder?.orderNumber
        ? lastOrder.orderNumber + 1
        : 300000;

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: nextOrderNumber,
          userId,
          total,
          fullName: dto.fullName,
          phone: dto.phone,
          deliveryMethod: dto.deliveryMethod,
          city: dto.city,
          street: dto.street,
          house: dto.house,
          apartment: dto.apartment,
          comment: dto.comment,
          items: {
            create: cartItems.map((item) => ({
              sellerId: item.product.sellerId,
              titleSnapshot: item.product.title,
              skuSnapshot: item.product.sku ?? null,
              priceSnapshot: item.product.price,
              quantity: item.quantity,
              status: 'PENDING',
              product: {
                connect: {
                  id: item.productId,
                },
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { position: 'asc' } },
                },
              },
            },
          },
        },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return createdOrder;
    });

    return order;
  }

  async findMyOrders(userId: string, query: QueryOrdersDto) {
    const where: any = { userId };

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
    }

    if (query.dateFrom) {
      const from = new Date(`${query.dateFrom}T00:00:00.000Z`);

      if (Number.isNaN(from.getTime())) {
        throw new BadRequestException('Некорректная дата "dateFrom"');
      }

      where.createdAt.gte = from;
    }

    if (query.dateTo) {
      const to = new Date(`${query.dateTo}T23:59:59.999Z`);

      if (Number.isNaN(to.getTime())) {
        throw new BadRequestException('Некорректная дата "dateTo"');
      }

      where.createdAt.lte = to;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            titleSnapshot: true,
            quantity: true,
            priceSnapshot: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }

  async findSellerOrders(userId: string, query: QueryOrdersDto) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSellerApproved: true },
    });

    if (!seller || seller.role !== 'SELLER' || !seller.isSellerApproved) {
      throw new ForbiddenException('Доступ только для одобренного продавца');
    }

    const where: any = {
      items: {
        some: {
          sellerId: userId,
          ...(query.status ? { status: query.status } : {}),
        },
      },
    };

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
    }

    if (query.dateFrom) {
      where.createdAt.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
    }

    if (query.dateTo) {
      where.createdAt.lte = new Date(`${query.dateTo}T23:59:59.999Z`);
    }

    if (query.deliveryMethod) {
      where.deliveryMethod = query.deliveryMethod;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      const searchNumber = Number(search);

      where.OR = [
        ...(Number.isNaN(searchNumber) ? [] : [{ orderNumber: searchNumber }]),
        { user: { email: { contains: search } } },
        {
          items: {
            some: {
              sellerId: userId,
              OR: [
                { titleSnapshot: { contains: search } },
                { skuSnapshot: { contains: search } },
              ],
            },
          },
        },
      ];
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            username: true,
            phone: true,
          },
        },
        items: {
          where: {
            sellerId: userId,
            ...(query.status ? { status: query.status } : {}),
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders
      .map((order) => {
        const sellerTotal = order.items.reduce(
          (sum, item) => sum + Number(item.priceSnapshot) * item.quantity,
          0,
        );

        const derivedStatus = this.getAggregateStatus(order.items);

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: derivedStatus,
          createdAt: order.createdAt,
          totalAmount: Number(order.total),
          sellerTotal,
          user: order.user,
          items: order.items,
        };
      })
      .filter((order) => order.items.length > 0);
  }

  async findSellerOrderById(userId: string, orderId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSellerApproved: true },
    });

    if (!seller || seller.role !== 'SELLER' || !seller.isSellerApproved) {
      throw new ForbiddenException('Доступ только для одобренного продавца');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            sellerId: userId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            username: true,
            phone: true,
          },
        },
        items: {
          where: {
            sellerId: userId,
          },
          include: {
            product: {
              include: {
                images: { orderBy: { position: 'asc' } },
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    const sellerTotal = order.items.reduce(
      (sum, item) => sum + Number(item.priceSnapshot) * item.quantity,
      0,
    );

    const derivedStatus = this.getAggregateStatus(order.items);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: derivedStatus,
      createdAt: order.createdAt,
      totalAmount: Number(order.total),
      sellerTotal,
      fullName: order.fullName,
      phone: order.phone,
      deliveryMethod: order.deliveryMethod,
      address: this.buildAddress(order),
      comment: order.comment,
      user: order.user,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        sellerId: item.sellerId,
        titleSnapshot: item.titleSnapshot,
        skuSnapshot: item.skuSnapshot,
        priceSnapshot: Number(item.priceSnapshot),
        quantity: item.quantity,
        status: item.status,
        product: item.product,
      })),
    };
  }

  async updateSellerOrderItemStatus(
    userId: string,
    itemId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSellerApproved: true },
    });

    if (!seller || seller.role !== 'SELLER' || !seller.isSellerApproved) {
      throw new ForbiddenException('Доступ только для одобренного продавца');
    }

    const item = await this.prisma.orderItem.findFirst({
      where: {
        id: itemId,
        sellerId: userId,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Позиция заказа не найдена');
    }

    const nextStatus = dto.status;

    // Seller может ставить только эти статусы
    if (!['PROCESSING', 'SHIPPED', 'OUT_OF_STOCK'].includes(nextStatus)) {
      throw new ForbiddenException(
        'Продавец может менять статус только на "Принял", "Отправил" или "Отсутствует"',
      );
    }

    // После "Отправил" и "Отсутствует" менять уже ничего нельзя
    if (['SHIPPED', 'OUT_OF_STOCK'].includes(item.status)) {
      throw new ForbiddenException(
        'После статуса "Отправил" или "Отсутствует" продавец больше не может менять статус',
      );
    }

    // "Принял" только из нового
    if (nextStatus === 'PROCESSING' && item.status !== 'PENDING') {
      throw new ForbiddenException(
        'Статус "Принял" можно установить только для нового заказа',
      );
    }

    // "Отправил" только после "Принял"
    if (nextStatus === 'SHIPPED' && item.status !== 'PROCESSING') {
      throw new ForbiddenException(
        'Статус "Отправил" можно установить только после статуса "Принял"',
      );
    }

    // "Отсутствует" можно поставить из PENDING или PROCESSING
    if (
      nextStatus === 'OUT_OF_STOCK' &&
      !['PENDING', 'PROCESSING'].includes(item.status)
    ) {
      throw new ForbiddenException(
        'Статус "Отсутствует" можно установить только для нового или принятого заказа',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const updatedItem = await tx.orderItem.update({
        where: { id: itemId },
        data: {
          status: nextStatus,
        },
      });

      // Если товара нет — блокируем весь заказ и скрываем все товары из этого заказа
      if (nextStatus === 'OUT_OF_STOCK') {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: item.orderId },
          select: { productId: true },
        });

        const productIds = [...new Set(orderItems.map((x) => x.productId))];

        if (productIds.length > 0) {
          await tx.product.updateMany({
            where: {
              id: { in: productIds },
            },
            data: {
              isPublished: false,
            },
          });
        }

        await tx.order.update({
          where: { id: item.orderId },
          data: {
            status: 'OUT_OF_STOCK',
          },
        });

        return;
      }

      // Начисляем баланс за конкретную позицию, когда Seller ставит "Отправил"
      if (nextStatus === 'SHIPPED') {
        const existingBalanceTx = await tx.sellerBalanceTransaction.findFirst({
          where: {
            orderItemId: item.id,
            type: 'CREDIT_ORDER_SHIPPED',
          },
        });

        if (!existingBalanceTx) {
          const amountInCents =
            Math.round(Number(item.priceSnapshot) * 100) * item.quantity;

          if (amountInCents > 0) {
            const existingBalance = await tx.sellerBalance.findUnique({
              where: { sellerId: userId },
            });

            if (!existingBalance) {
              await tx.sellerBalance.create({
                data: {
                  sellerId: userId,
                  amount: 0,
                },
              });
            }

            await tx.sellerBalanceTransaction.create({
              data: {
                sellerId: userId,
                orderId: item.orderId,
                orderItemId: item.id,
                type: 'CREDIT_ORDER_SHIPPED',
                amount: amountInCents,
                description: `Начисление за отправленную позицию ${item.titleSnapshot}`,
              },
            });

            await tx.sellerBalance.update({
              where: { sellerId: userId },
              data: {
                amount: {
                  increment: amountInCents,
                },
              },
            });
          }
        }
      }

      const refreshedItems = await tx.orderItem.findMany({
        where: { orderId: item.orderId },
        select: { status: true },
      });

      const nextOrderStatus = this.getAggregateStatus(refreshedItems);

      await tx.order.update({
        where: { id: item.orderId },
        data: {
          status: nextOrderStatus,
        },
      });
    });

    return { success: true };
  }

  private buildAddress(order: {
    city: string | null;
    street: string | null;
    house: string | null;
    apartment: string | null;
  }) {
    return [
      order.city,
      order.street ? `ул. ${order.street}` : null,
      order.house ? `дом ${order.house}` : null,
      order.apartment ? `кв. ${order.apartment}` : null,
    ]
      .filter(Boolean)
      .join(', ');
  }

  private getAggregateStatus(
    items: Array<{ status: string }>,
  ):
    | 'PENDING'
    | 'PAID'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'OUT_OF_STOCK' {
    if (!items.length) return 'PENDING';

    const statuses = items.map((item) => item.status);

    if (statuses.some((s) => s === 'OUT_OF_STOCK')) return 'OUT_OF_STOCK';
    if (statuses.every((s) => s === 'CANCELLED')) return 'CANCELLED';
    if (statuses.every((s) => s === 'DELIVERED')) return 'DELIVERED';
    if (statuses.every((s) => s === 'SHIPPED')) return 'SHIPPED';
    if (statuses.some((s) => s === 'PROCESSING')) return 'PROCESSING';
    if (statuses.some((s) => s === 'PAID')) return 'PAID';
    return 'PENDING';
  }

  private async syncOrderStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return;

    const nextStatus = this.getAggregateStatus(order.items);

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
      },
    });
  }
}