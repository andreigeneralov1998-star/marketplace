import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const NO_PHOTO_URL = '/uploads/placeholders/no-photo.png';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
    private buildProductsWhere(
      query: QueryProductsDto,
      options?: { ignoreCategory?: boolean },
    ): Prisma.ProductWhereInput {
      return {
        isPublished: true,
        moderationStatus: 'APPROVED',
        stock: { gt: 0 },

        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search } },
                { sku: { contains: query.search } },
                { description: { contains: query.search } },
                {
                  category: {
                    name: { contains: query.search },
                  },
                },
              ],
            }
          : {}),

        ...(!options?.ignoreCategory && query.category
          ? { category: { slug: query.category } }
          : {}),

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
    }

    private getProductsOrderBy(
      sort?: QueryProductsDto['sort'],
    ): Prisma.ProductOrderByWithRelationInput {
      return sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'price_asc'
        ? { price: 'asc' }
        : sort === 'price_desc'
        ? { price: 'desc' }
        : sort === 'title_asc'
        ? { title: 'asc' }
        : sort === 'title_desc'
        ? { title: 'desc' }
        : { createdAt: 'desc' };
    }
  
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

    const where = this.buildProductsWhere(query);
    const orderBy = this.getProductsOrderBy(query.sort);

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
  async getCategoryCounts(query: QueryProductsDto) {
    const where = this.buildProductsWhere(query, { ignoreCategory: true });

    const grouped = await this.prisma.product.groupBy({
      by: ['categoryId'],
      where,
      _count: {
        _all: true,
      },
    });

    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const countsMap = new Map(
      grouped.map((item) => [item.categoryId, item._count._all]),
    );

    return categories
      .map((category) => ({
        ...category,
        count: countsMap.get(category.id) ?? 0,
      }))
      .filter((category) => {
        if (query.search) {
          return category.count > 0;
        }

        return true;
      });
  }

  async findOneBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        isPublished: true,
        moderationStatus: 'APPROVED',
        stock: { gt: 0 },
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
    async bulkUploadFromExcel(userId: string, file: Express.Multer.File) {
      const seller = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!seller || seller.role !== 'SELLER' || !seller.isSellerApproved) {
        throw new ForbiddenException('Seller is not approved');
      }

      const workbook = new ExcelJS.Workbook();

      try {
        await workbook.xlsx.load(file.buffer as any);
      } catch {
        throw new BadRequestException('Не удалось прочитать Excel-файл');
      }

      const sheet = workbook.getWorksheet('Товары') || workbook.worksheets[0];

      if (!sheet) {
        throw new BadRequestException('В Excel-файле отсутствует лист с товарами');
      }

      const headerRow = sheet.getRow(1);
      const rawHeaderValues = Array.isArray(headerRow.values) ? headerRow.values : [];
      const headers = rawHeaderValues
        .slice(1)
        .map((value) => String(value || '').trim());

      const requiredHeaders = [
        'Название',
        'Артикул',
        'Категория',
        'Цена',
        'Остаток',
        'Описание',
        'Совместимые модели',
      ];

      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          throw new BadRequestException(
            `В файле отсутствует обязательная колонка: ${header}`,
          );
        }
      }

      const headerIndexMap = new Map<string, number>();
      headers.forEach((header, index) => {
        headerIndexMap.set(header, index + 1);
      });

      const created: any[] = [];
      const errors: { row: number; message: string }[] = [];

      for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
        const excelRow = sheet.getRow(rowNumber);

        const title = String(
          excelRow.getCell(headerIndexMap.get('Название')!).value || '',
        ).trim();

        const rawSku = String(
          excelRow.getCell(headerIndexMap.get('Артикул')!).value || '',
        ).trim();

        const categoryName = String(
          excelRow.getCell(headerIndexMap.get('Категория')!).value || '',
        ).trim();

        const priceRaw = excelRow.getCell(headerIndexMap.get('Цена')!).value;
        const stockRaw = excelRow.getCell(headerIndexMap.get('Остаток')!).value;

        const description = String(
          excelRow.getCell(headerIndexMap.get('Описание')!).value || '',
        ).trim();

        const compatibleModels = String(
          excelRow.getCell(headerIndexMap.get('Совместимые модели')!).value || '',
        ).trim();

        const isEmptyRow =
          !title &&
          !rawSku &&
          !categoryName &&
          !priceRaw &&
          !stockRaw &&
          !description &&
          !compatibleModels;

        if (isEmptyRow) {
          continue;
        }

        try {
          const price = Number(priceRaw);
          const stock = Number(stockRaw);

          if (!title) {
            throw new Error('Не заполнено поле "Название"');
          }

          if (!rawSku) {
            throw new Error('Не заполнено поле "Артикул"');
          }

          if (!categoryName) {
            throw new Error('Не заполнено поле "Категория"');
          }

          if (!description) {
            throw new Error('Не заполнено поле "Описание"');
          }

          if (Number.isNaN(price) || price < 0) {
            throw new Error('Некорректное значение в колонке "Цена"');
          }

          if (Number.isNaN(stock) || stock < 0) {
            throw new Error('Некорректное значение в колонке "Остаток"');
          }

          const category = await this.prisma.category.findFirst({
            where: {
              name: categoryName,
            },
          });

          if (!category) {
            throw new Error(`Категория не найдена: ${categoryName}`);
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
            row: rowNumber,
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

  async getSellerExcelTemplate(): Promise<Buffer> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });

    const workbook = new ExcelJS.Workbook();

    const productsSheet = workbook.addWorksheet('Товары');
    const categoriesSheet = workbook.addWorksheet('Категории');

    const headers = [
      'Название',
      'Артикул',
      'Категория',
      'Цена',
      'Остаток',
      'Описание',
      'Совместимые модели',
    ];

    productsSheet.addRow(headers);

    const headerRow = productsSheet.getRow(1);
    headerRow.font = { bold: true };

    productsSheet.columns = [
      { key: 'title', width: 30 },
      { key: 'sku', width: 20 },
      { key: 'category', width: 24 },
      { key: 'price', width: 14 },
      { key: 'stock', width: 14 },
      { key: 'description', width: 40 },
      { key: 'compatibleModels', width: 28 },
    ];

    categoriesSheet.addRow(['Название категории']);
    categoriesSheet.getRow(1).font = { bold: true };

    for (const category of categories) {
      categoriesSheet.addRow([category.name]);
    }

    const lastCategoryRow = Math.max(categories.length + 1, 2);

    for (let row = 2; row <= 500; row++) {
      productsSheet.getCell(`C${row}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Категории!$A$2:$A$${lastCategoryRow}`],
        showErrorMessage: true,
        errorTitle: 'Неверная категория',
        error: 'Выберите категорию из выпадающего списка',
      };
    }

    productsSheet.getCell('A2').value = 'Дисплей iPhone 11';
    productsSheet.getCell('B2').value = 'IP11-INCELL-01';
    if (categories.length > 0) {
      productsSheet.getCell('C2').value = categories[0].name;
    }
    productsSheet.getCell('D2').value = 120;
    productsSheet.getCell('E2').value = 5;
    productsSheet.getCell('F2').value = 'Качественный дисплей';
    productsSheet.getCell('G2').value = 'iPhone 11';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
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