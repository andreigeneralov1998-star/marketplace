import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const NO_PHOTO_URL = '/uploads/placeholders/no-photo.png';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  
  private generateRandomSku() {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `SKU-${Date.now().toString().slice(-6)}-${random}`;
  }

  private async makeUniqueSku(inputSku?: string, excludeId?: string) {
    let sku = (inputSku || this.generateRandomSku()).trim().toUpperCase();

    while (true) {
      const existing = await this.prisma.product.findFirst({
        where: {
          sku,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });

      if (!existing) return sku;

      sku = this.generateRandomSku();
    }
  }
  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isPublished: true,
      moderationStatus: 'APPROVED',

      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search} },
              { sku: { contains: query.search} },
              { description: { contains: query.search} },
              {
                category: {
                  name: { contains: query.search},
                },
              },
            ],
          }
        : {}),

      ...(query.category ? { category: { slug: query.category } } : {}),

      ...(query.sellerId ? { sellerId: query.sellerId } : {}),

      ...(query.storeSlug
        ? {
            seller: {
              storeSlug: query.storeSlug,
              role: 'SELLER',
              isSellerApproved: true,
            },
          }
        : {}),

      ...(typeof query.minPrice === 'number' || typeof query.maxPrice === 'number'
        ? {
            price: {
              ...(typeof query.minPrice === 'number' ? { gte: query.minPrice } : {}),
              ...(typeof query.maxPrice === 'number' ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),

      ...(query.inStock ? { stock: { gt: 0 } } : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'oldest'
        ? { createdAt: 'asc' }
        : query.sort === 'price_asc'
        ? { price: 'asc' }
        : query.sort === 'price_desc'
        ? { price: 'desc' }
        : query.sort === 'title_asc'
        ? { title: 'asc' }
        : query.sort === 'title_desc'
        ? { title: 'desc' }
        : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
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
              storeLogo: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
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
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        isPublished: true,
        moderationStatus: 'APPROVED'
      },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
            username: true,
            storeName: true,
            storeSlug: true,
            storeDescription: true,
            storeLogo: true,
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

    if (dto.imageUrls?.length && dto.imageUrls.length > 3) {
      throw new ForbiddenException('Можно загрузить не более 3 фото');
    }

    const baseSlug = slugify(dto.slug || dto.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const slug = await this.makeUniqueSlug(baseSlug);
    const sku = await this.makeUniqueSku(dto.sku);

    return this.prisma.product.create({
      data: {
        title: dto.title.trim(),
        slug,
        description: dto.description.trim(),
        compatibleModels: dto.compatibleModels?.trim() || null,
        specs: dto.specs as Prisma.InputJsonValue,
        price: dto.price,
        stock: dto.stock,
        sku,
        categoryId: dto.categoryId,
        isPublished: false,
        moderationStatus: 'PENDING',
        moderationComment: null,
        sellerId: userId,
        imageUrl: dto.imageUrls?.length ? dto.imageUrls[0] : NO_PHOTO_URL,
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
    async bulkUploadFromCsv(userId: string, file: Express.Multer.File) {
      const seller = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!seller || seller.role !== 'SELLER' || !seller.isSellerApproved) {
        throw new ForbiddenException('Seller is not approved');
      }

      const content = file.buffer.toString('utf-8');

      let rows: Record<string, string>[] = [];

      try {
        rows = parse(content, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          delimiter: ';',
        });
      } catch {
        throw new BadRequestException('Не удалось прочитать CSV-файл');
      }

      if (!rows.length) {
        throw new BadRequestException('CSV-файл пустой');
      }

      const requiredHeaders = [
        'title',
        'sku',
        'categorySlug',
        'price',
        'stock',
        'description',
        'compatibleModels',
      ];

      const headers = Object.keys(rows[0] || {});
      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          throw new BadRequestException(
            `В файле отсутствует обязательная колонка: ${header}`,
          );
        }
      }

      const created: any[] = [];
      const errors: { row: number; message: string }[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        try {
          const title = String(row.title || '').trim();
          const rawSku = String(row.sku || '').trim();
          const categorySlug = String(row.categorySlug || '').trim();
          const description = String(row.description || '').trim();
          const price = Number(row.price);
          const stock = Number(row.stock);
          const compatibleModels = String(row.compatibleModels || '').trim();

          if (!title) {
            throw new Error('Не заполнено поле title');
          }

          if (!rawSku) {
            throw new Error('Не заполнено поле sku');
          }

          if (!categorySlug) {
            throw new Error('Не заполнено поле categorySlug');
          }

          if (!description) {
            throw new Error('Не заполнено поле description');
          }

          if (Number.isNaN(price) || price < 0) {
            throw new Error('Некорректное значение price');
          }

          if (Number.isNaN(stock) || stock < 0) {
            throw new Error('Некорректное значение stock');
          }

          const category = await this.prisma.category.findFirst({
            where: { slug: categorySlug },
          });

          if (!category) {
            throw new Error(`Категория не найдена: ${categorySlug}`);
          }

          const baseSlug = slugify(title, {
            lower: true,
            strict: true,
            trim: true,
          });

          const slug = await this.makeUniqueSlug(baseSlug);
          const sku = await this.makeUniqueSku(rawSku);

          const product = await this.prisma.product.create({
            data: {
              title,
              slug,
              description,
              compatibleModels: compatibleModels || null,
              specs: {},
              price,
              stock,
              sku,
              categoryId: category.id,
              isPublished: false,
              moderationStatus: 'PENDING',
              moderationComment: null,
              sellerId: userId,
              imageUrl: NO_PHOTO_URL,
            },
          });

          created.push(product);
        } catch (error: any) {
          errors.push({
            row: i + 2,
            message: error?.message || 'Ошибка обработки строки',
          });
        }
      }

      return {
        success: created.length > 0,
        createdCount: created.length,
        errorCount: errors.length,
        errors,
      };
    }

  getSellerCsvTemplate() {
    return 'title;sku;categorySlug;price;stock;description;compatibleModels';
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
  async addImages(
    userId: string,
    role: string,
    productId: string,
    files: Express.Multer.File[],
  ) {
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

    if (role !== 'ADMIN' && product.sellerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Файлы не загружены');
    }

    if ((product.images?.length || 0) + files.length > 3) {
      throw new ForbiddenException('У товара может быть не более 3 фото');
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

    if (imagesData.length > 0) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { imageUrl: imagesData[0].url },
      });
    }

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
      id: string,
      dto: UpdateProductDto,
    ) {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const isAdmin = role === 'ADMIN';

      if (!isAdmin && product.sellerId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      if (dto.imageUrls && dto.imageUrls.length > 3) {
        throw new ForbiddenException('Можно загрузить не более 3 фото');
      }

      const data: any = {
        title: dto.title,
        description: dto.description,
        compatibleModels: dto.compatibleModels,
        specs: dto.specs as Prisma.InputJsonValue,
        price: dto.price,
        stock: dto.stock,
        categoryId: dto.categoryId,
      };

      if (dto.sku) {
        data.sku = await this.makeUniqueSku(dto.sku, product.id);
      }

      if (!isAdmin) {
        data.isPublished = false;
        data.moderationStatus = 'PENDING';
        data.moderationComment = null;
      }

      if (isAdmin && typeof (dto as any).isPublished === 'boolean') {
        data.isPublished = (dto as any).isPublished;
      }

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
            where: { productId: id },
          });

          data.images = {
            create: dto.imageUrls.map((url, index) => ({
              url,
              position: index,
            })),
          };

          data.imageUrl = dto.imageUrls.length ? dto.imageUrls[0] : NO_PHOTO_URL;
        }

        return tx.product.update({
          where: { id },
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

    return this.prisma.product.update({
      where: { id: productId },
      data: { isPublished: false },
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