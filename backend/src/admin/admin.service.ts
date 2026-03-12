import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isSellerApproved: true,
        createdAt: true,
      },
    });
  }

  approveSeller(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'SELLER',
        isSellerApproved: true,
      },
    });
  }

  revokeSeller(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'BUYER',
        isSellerApproved: false,
      },
    });
  }
}