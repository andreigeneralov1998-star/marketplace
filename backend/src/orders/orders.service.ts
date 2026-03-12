import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return this.prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${item.product.title}`,
          );
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          fullName: dto.fullName,
          phone: dto.phone,
          address: dto.address,
          comment: dto.comment,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              sellerId: item.product.sellerId,
              titleSnapshot: item.product.title,
              skuSnapshot: item.product.sku,
              priceSnapshot: item.product.price,
              quantity: item.quantity,
              status: OrderStatus.PENDING,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  buyerOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async myHistory(userId: string) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);

    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        createdAt: {
          gte: dateFrom,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      fullName: order.fullName,
      phone: order.phone,
      address: order.address,
      comment: order.comment,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        sellerId: item.sellerId,
        title: item.titleSnapshot,
        sku: item.skuSnapshot,
        quantity: item.quantity,
        price: Number(item.priceSnapshot),
        status: item.status,
      })),
    }));
  }

  sellerOrders(userId: string) {
    return this.prisma.order.findMany({
      where: {
        items: {
          some: { sellerId: userId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          where: { sellerId: userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  allOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    });
  }

  async updateSellerItemStatus(
    userId: string,
    itemId: string,
    status: OrderStatus,
  ) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    if (item.sellerId !== userId) {
      throw new BadRequestException('You can update only your own items');
    }

    const updatedItem = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { status },
    });

    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: item.orderId },
      select: { status: true },
    });

    const statuses = orderItems.map((i) => i.status);

    let orderStatus: OrderStatus = OrderStatus.PENDING;

    if (statuses.every((s) => s === OrderStatus.DELIVERED)) {
      orderStatus = OrderStatus.DELIVERED;
    } else if (statuses.every((s) => s === OrderStatus.CANCELLED)) {
      orderStatus = OrderStatus.CANCELLED;
    } else if (
      statuses.every(
        (s) => s === OrderStatus.SHIPPED || s === OrderStatus.DELIVERED,
      )
    ) {
      orderStatus = OrderStatus.SHIPPED;
    } else if (
      statuses.some(
        (s) =>
          s === OrderStatus.PROCESSING ||
          s === OrderStatus.SHIPPED ||
          s === OrderStatus.DELIVERED,
      )
    ) {
      orderStatus = OrderStatus.PROCESSING;
    } else if (statuses.every((s) => s === OrderStatus.PAID)) {
      orderStatus = OrderStatus.PAID;
    }

    await this.prisma.order.update({
      where: { id: item.orderId },
      data: { status: orderStatus },
    });

    return updatedItem;
  }
}