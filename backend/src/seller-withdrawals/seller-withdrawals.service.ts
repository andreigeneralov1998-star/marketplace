import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  SellerBalanceTransactionType,
  SellerWithdrawalMethod,
  SellerWithdrawalStatus,
  OrderStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopsetBalanceWithdrawalDto } from './dto/create-topset-balance-withdrawal.dto';
import { CreateTopsetCashWithdrawalDto } from './dto/create-topset-cash-withdrawal.dto';

@Injectable()
export class SellerWithdrawalsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAvailableBalanceInCents(
    tx: Prisma.TransactionClient,
    sellerId: string,
  ) {
    const paidItems = await tx.orderItem.findMany({
      where: {
        sellerId,
        status: OrderStatus.PAID,
      },
      select: {
        priceSnapshot: true,
        quantity: true,
      },
    });

    const paidTotalInCents = paidItems.reduce((sum, item) => {
      return sum + Math.round(Number(item.priceSnapshot) * 100) * item.quantity;
    }, 0);

    const approvedWithdrawals = await tx.sellerWithdrawalRequest.aggregate({
      where: {
        sellerId,
        status: SellerWithdrawalStatus.APPROVED,
      },
      _sum: {
        amount: true,
      },
    });

    const withdrawnInCents = Number(approvedWithdrawals._sum.amount ?? 0);

    return Math.max(0, paidTotalInCents - withdrawnInCents);
  }

  async createTopsetBalanceRequest(
    sellerId: string,
    dto: CreateTopsetBalanceWithdrawalDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const availableBalanceInCents = await this.getAvailableBalanceInCents(tx, sellerId);
      const amountInCents = Math.round(dto.amount * 100);

      if (amountInCents <= 0) {
        throw new BadRequestException('Сумма должна быть больше нуля');
      }

      if (amountInCents > availableBalanceInCents) {
        throw new BadRequestException('Сумма превышает доступный баланс');
      }

      return tx.sellerWithdrawalRequest.create({
        data: {
          sellerId,
          amount: amountInCents,
          method: SellerWithdrawalMethod.TOPSET_BALANCE,
          topsetAccountName: dto.topsetAccountName,
        },
      });
    });
  }

  async createTopsetCashRequest(
    sellerId: string,
    dto: CreateTopsetCashWithdrawalDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const availableBalanceInCents = await this.getAvailableBalanceInCents(tx, sellerId);
      const amountInCents = Math.round(dto.amount * 100);

      if (amountInCents <= 0) {
        throw new BadRequestException('Сумма должна быть больше нуля');
      }

      if (amountInCents > availableBalanceInCents) {
        throw new BadRequestException('Сумма превышает доступный баланс');
      }

      return tx.sellerWithdrawalRequest.create({
        data: {
          sellerId,
          amount: amountInCents,
          method: SellerWithdrawalMethod.TOPSET_CASH,
          pickupLocation: dto.pickupLocation,
          comment: dto.comment ?? null,
        },
      });
    });
  }

  async findMyRequests(sellerId: string) {
    const requests = await this.prisma.sellerWithdrawalRequest.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      ...r,
      amount: r.amount / 100,
    }));
  }

  async approveRequest(id: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.sellerWithdrawalRequest.findUnique({
        where: { id },
      });

      if (!request) {
        throw new NotFoundException('Заявка не найдена');
      }

      if (request.status !== SellerWithdrawalStatus.PENDING) {
        throw new BadRequestException('Заявка уже обработана');
      }

      const availableBalanceInCents = await this.getAvailableBalanceInCents(
        tx,
        request.sellerId,
      );

      if (request.amount > availableBalanceInCents) {
        throw new BadRequestException(
          'Недостаточно доступного баланса для подтверждения заявки',
        );
      }

      const sellerBalance = await tx.sellerBalance.findUnique({
        where: { sellerId: request.sellerId },
      });

      if (!sellerBalance) {
        throw new NotFoundException('Баланс продавца не найден');
      }

      await tx.sellerBalance.update({
        where: { sellerId: request.sellerId },
        data: {
          amount: {
            decrement: request.amount,
          },
        },
      });

      await tx.sellerBalanceTransaction.create({
        data: {
          sellerId: request.sellerId,
          type: SellerBalanceTransactionType.DEBIT_WITHDRAWAL_APPROVED,
          amount: request.amount,
          description: `Подтвержден вывод средств (${request.method})`,
        },
      });

      const updated = await tx.sellerWithdrawalRequest.update({
        where: { id: request.id },
        data: {
          status: SellerWithdrawalStatus.APPROVED,
          processedAt: new Date(),
          processedByAdminId: adminId,
        },
      });

      return {
        ...updated,
        amount: updated.amount / 100,
      };
    });
  }

  async rejectRequest(id: string, adminId: string) {
    const request = await this.prisma.sellerWithdrawalRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (request.status !== SellerWithdrawalStatus.PENDING) {
      throw new BadRequestException('Заявка уже обработана');
    }

    const updated = await this.prisma.sellerWithdrawalRequest.update({
      where: { id },
      data: {
        status: SellerWithdrawalStatus.REJECTED,
        processedAt: new Date(),
        processedByAdminId: adminId,
      },
    });

    return {
      ...updated,
      amount: updated.amount / 100,
    };
  }
}