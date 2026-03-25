import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, SellerBalanceTransactionType } from '@prisma/client';

@Injectable()
export class SellerBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureBalanceExists(sellerId: string) {
    let balance = await this.prisma.sellerBalance.findUnique({
      where: { sellerId },
    });

    if (!balance) {
      balance = await this.prisma.sellerBalance.create({
        data: {
          sellerId,
          amount: 0,
        },
      });
    }

    return balance;
  }

  async creditForShippedOrder(params: {
    sellerId: string;
    orderId: string;
    amount: number;
    description?: string;
  }) {
    const { sellerId, orderId, amount, description } = params;

    const amountInCents = Math.round(amount * 100);

    if (amountInCents <= 0) return;

    const existing = await this.prisma.sellerBalanceTransaction.findFirst({
      where: {
        sellerId,
        orderId,
        type: SellerBalanceTransactionType.CREDIT_ORDER_SHIPPED,
      },
    });

    if (existing) return;

    await this.ensureBalanceExists(sellerId);

    await this.prisma.$transaction(async (tx) => {
      await tx.sellerBalanceTransaction.create({
        data: {
          sellerId,
          orderId,
          type: SellerBalanceTransactionType.CREDIT_ORDER_SHIPPED,
          amount: amountInCents,
          description: description ?? 'Начисление за отправленный заказ',
        },
      });

      await tx.sellerBalance.update({
        where: { sellerId },
        data: {
          amount: {
            increment: amountInCents,
          },
        },
      });
    });
  }

  async getSellerAvailableBalance(sellerId: string) {
    const paidItems = await this.prisma.orderItem.findMany({
      where: {
        sellerId,
        status: OrderStatus.PAID,
      },
      select: {
        priceSnapshot: true,
        quantity: true,
      },
    });

    const paidTotal = paidItems.reduce((sum, item) => {
      return sum + Number(item.priceSnapshot) * item.quantity;
    }, 0);

    const approvedWithdrawals = await this.prisma.sellerWithdrawalRequest.aggregate({
      where: {
        sellerId,
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
    });

    const withdrawn = Number(approvedWithdrawals._sum.amount ?? 0) / 100;

    return Math.max(0, paidTotal - withdrawn);
  }

  async getSellerBalance(sellerId: string) {
    await this.ensureBalanceExists(sellerId);

    const balance = await this.prisma.sellerBalance.findUnique({
      where: { sellerId },
    });

    const availableBalance = await this.getSellerAvailableBalance(sellerId);

    const transactions = await this.prisma.sellerBalanceTransaction.findMany({
      where: { sellerId },
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      balance: (balance?.amount || 0) / 100,
      availableBalance,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount / 100,
        description: t.description,
        createdAt: t.createdAt,
        orderId: t.orderId,
        order: t.order,
      })),
    };
  }
}