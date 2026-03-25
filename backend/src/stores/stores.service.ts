import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}
  
  async findAll() {
    const stores = await this.prisma.user.findMany({
      where: {
        role: 'SELLER',
        isSellerApproved: true,
        storeSlug: {
          not: null,
        },
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        storeName: true,
        storeSlug: true,
        storeDescription: true,
        storeLogo: true,
        createdAt: true,
        products: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stores.map((store) => ({
      id: store.id,
      fullName: store.fullName,
      username: store.username,
      storeName: store.storeName,
      storeSlug: store.storeSlug,
      storeDescription: store.storeDescription,
      storeLogo: store.storeLogo,
      createdAt: store.createdAt,
      productsCount: store.products.length,
    }));
  }
  async findOneBySlug(storeSlug: string) {
    const store = await this.prisma.user.findFirst({
      where: {
        role: 'SELLER',
        isSellerApproved: true,
        isProfileComplete: true,
        storeSlug: {
          not: null,
        },
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        city: true,
        warehouseAddress: true,
        storeName: true,
        storeSlug: true,
        storeDescription: true,
        storeLogo: true,
        createdAt: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Магазин продавца не найден');
    }

    return store;
  }

  async findStoreProducts(storeSlug: string) {
    const store = await this.prisma.user.findFirst({
      where: {
        storeSlug,
        role: 'SELLER',
        isSellerApproved: true,
        isProfileComplete: true,
      },
      select: {
        id: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Магазин продавца не найден');
    }

    return this.prisma.product.findMany({
      where: {
        sellerId: store.id,
        isPublished: true,
      },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            phone: true,
            storeName: true,
            storeSlug: true,
            storeLogo: true,
            storeDescription: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}