import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async getStores() {
    return this.prisma.user.findMany({
      where: {
        role: 'SELLER',
        storeName: { not: null },
        storeSlug: { not: null },
      },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        storeDescription: true,
        storeLogo: true,
      },
      orderBy: {
        storeName: 'asc',
      },
    });
  }
  async getMySellerProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        lastName: true,
        firstName: true,
        middleName: true,
        phone: true,
        city: true,
        warehouseAddress: true,
        storeName: true,
        storeDescription: true,
        storeLogo: true,
        storeSlug: true,
        isProfileComplete: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.role !== 'SELLER') {
      throw new ForbiddenException('Профиль продавца доступен только Seller');
    }

    return {
      ...user,
      isProfileComplete:
        typeof user.isProfileComplete === 'boolean'
          ? user.isProfileComplete
          : this.isSellerProfileComplete(user),
    };
  }

  async updateMySellerProfile(
    userId: string,
    dto: UpdateSellerProfileDto,
    logoUrl?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        storeSlug: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.role !== 'SELLER') {
      throw new ForbiddenException('Профиль продавца доступен только Seller');
    }

    const slug = this.slugify(dto.storeName);

    const existing = await this.prisma.user.findFirst({
      where: {
        storeSlug: slug,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('Название магазина уже занято');
    }

    const isComplete = this.isSellerProfileComplete({
      lastName: dto.lastName,
      firstName: dto.firstName,
      phone: dto.phone,
      city: dto.city,
      warehouseAddress: dto.warehouseAddress,
      storeName: dto.storeName,
    });

    const data: Prisma.UserUpdateInput = {
      lastName: dto.lastName,
      firstName: dto.firstName,
      middleName: dto.middleName,
      phone: dto.phone,
      city: dto.city,
      warehouseAddress: dto.warehouseAddress,
      storeName: dto.storeName,
      storeDescription: dto.storeDescription ?? null,
      storeSlug: slug,
      isProfileComplete: isComplete,
    };

    if (logoUrl) {
      data.storeLogo = logoUrl;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        lastName: true,
        firstName: true,
        middleName: true,
        phone: true,
        city: true,
        warehouseAddress: true,
        storeName: true,
        storeDescription: true,
        storeLogo: true,
        storeSlug: true,
        isProfileComplete: true,
      },
    });

    return updated;
  }

  private isSellerProfileComplete(user: {
    lastName?: string | null;
    firstName?: string | null;
    phone?: string | null;
    city?: string | null;
    warehouseAddress?: string | null;
    storeName?: string | null;
  }) {
    return Boolean(
      user.lastName?.trim() &&
      user.firstName?.trim() &&
      user.phone?.trim() &&
      user.city?.trim() &&
      user.warehouseAddress?.trim() &&
      user.storeName?.trim(),
    );
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-zа-я0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}