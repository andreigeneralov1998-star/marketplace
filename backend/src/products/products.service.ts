import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { position: 'asc' } },
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOneBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(userId: string, dto: CreateProductDto) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!seller || seller.role !== 'SELLER' || !seller.isSellerApproved) {
      throw new ForbiddenException('Seller is not approved');
    }

    const baseSlug = slugify(dto.slug || dto.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const slug = await this.makeUniqueSlug(baseSlug);

    return this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        specs: dto.specs as Prisma.InputJsonValue,
        price: dto.price,
        stock: dto.stock,
        sku: dto.sku,
        categoryId: dto.categoryId,
        isPublished: dto.isPublished ?? true,
        sellerId: userId,
        images: dto.imageUrls?.length
          ? {
              create: dto.imageUrls.map((url, index) => ({
                url,
                position: index,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        category: true,
      },
    });
  }

  async findSellerProducts(userId: string) {
    return this.prisma.product.findMany({
      where: { sellerId: userId },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async addImages(productId: string, files: Express.Multer.File[]) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    const startPosition = product.images.length;

    const imagesData = files.map((file, index) => ({
      url: `/uploads/products/${file.filename}`,
      productId,
      position: startPosition + index,
    }));

    await this.prisma.productImage.createMany({
      data: imagesData,
    });

    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
        category: true,
      },
    });
  }
  async update(
    userId: string,
    role: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (role !== 'ADMIN' && product.sellerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const data: any = {
      title: dto.title,
      description: dto.description,
      specs: dto.specs as Prisma.InputJsonValue,
      price: dto.price,
      stock: dto.stock,
      sku: dto.sku,
      categoryId: dto.categoryId,
      isPublished: dto.isPublished,
    };

    if (dto.slug || dto.title) {
      const baseSlug = slugify(dto.slug || dto.title || product.title, {
        lower: true,
        strict: true,
        trim: true,
      });

      data.slug = await this.makeUniqueSlug(baseSlug, product.id);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.imageUrls) {
        await tx.productImage.deleteMany({
          where: { productId },
        });

        data.images = {
          create: dto.imageUrls.map((url, index) => ({
            url,
            position: index,
          })),
        };
      }

      return tx.product.update({
        where: { id: productId },
        data,
        include: {
          images: true,
          category: true,
        },
      });
    });
  }

  async remove(userId: string, role: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (role !== 'ADMIN' && product.sellerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  private async makeUniqueSlug(baseSlug: string, excludeId?: string) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findFirst({
        where: {
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter++}`;
    }
  }
}