import {
  BadRequestException,
  ForbiddenException,
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

  async buyerOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        priceSnapshot: Number(item.priceSnapshot),
      })),
    }));
  }
  async sellerOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
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
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const sellerTotal = order.items.reduce((sum, item) => {
      return sum + Number(item.priceSnapshot) * item.quantity;
    }, 0);

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      sellerTotal,
      items: order.items.map((item) => ({
        ...item,
        priceSnapshot: Number(item.priceSnapshot),
      })),
    };
  }

  async orderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
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
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        priceSnapshot: Number(item.priceSnapshot),
      })),
    };
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

  async sellerOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
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

    return orders.map((order) => {
      const sellerTotal = order.items.reduce((sum, item) => {
        return sum + Number(item.priceSnapshot) * item.quantity;
      }, 0);

      return {
        ...order,
        totalAmount: Number(order.totalAmount),
        sellerTotal,
        items: order.items.map((item) => ({
          ...item,
          priceSnapshot: Number(item.priceSnapshot),
        })),
      };
    });
  }

  async allOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        priceSnapshot: Number(item.priceSnapshot),
      })),
    }));
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.updateMany({
        where: { orderId },
        data: { status: dto.status },
      });

      return tx.order.update({
        where: { id: orderId },
        data: { status: dto.status },
        include: {
          items: true,
        },
      });
    });

    return {
      ...updatedOrder,
      totalAmount: Number(updatedOrder.totalAmount),
      items: updatedOrder.items.map((item) => ({
        ...item,
        priceSnapshot: Number(item.priceSnapshot),
      })),
    };
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
      throw new ForbiddenException('You can update only your own items');
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
    const orderStatus = this.calculateOrderStatus(statuses);

    await this.prisma.order.update({
      where: { id: item.orderId },
      data: { status: orderStatus },
    });

    return updatedItem;
  }
  private calculateOrderStatus(statuses: OrderStatus[]): OrderStatus {
    if (statuses.every((s) => s === OrderStatus.DELIVERED)) {
      return OrderStatus.DELIVERED;
    }

    if (statuses.every((s) => s === OrderStatus.CANCELLED)) {
      return OrderStatus.CANCELLED;
    }

    if (statuses.every((s) => s === OrderStatus.SHIPPED || s === OrderStatus.DELIVERED)) {
      return OrderStatus.SHIPPED;
    }

    if (statuses.some((s) =>
      s === OrderStatus.PROCESSING ||
      s === OrderStatus.SHIPPED ||
      s === OrderStatus.DELIVERED
    )) {
      return OrderStatus.PROCESSING;
    }

    if (statuses.some((s) => s === OrderStatus.PAID)) {
      return OrderStatus.PAID;
    }

    return OrderStatus.PENDING;
  }
}