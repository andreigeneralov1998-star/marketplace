import {
  Body,
  Controller,
  UploadedFile,
  Res,
  BadRequestException,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

function editFileName(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const fileExtName = extname(file.originalname);
  callback(null, `${uniqueSuffix}${fileExtName}`);
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('category-counts')
  getCategoryCounts(@Query() query: QueryProductsDto) {
    return this.productsService.getCategoryCounts(query);
  }

  @Get('seller/my')
  @UseGuards(JwtAuthGuard)
  sellerProducts(@Req() req: { user: { userId: string } }) {
    return this.productsService.findSellerProducts(req.user.userId);
  }
  @Get('seller/excel-template')
  @UseGuards(JwtAuthGuard)
  async downloadSellerExcelTemplate(@Res() res: Response) {
    const fileBuffer = await this.productsService.getSellerExcelTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="products-template.xlsx"',
    );

    return res.send(fileBuffer);
  }

  @Post('seller/bulk-upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSellerProductsExcel(
    @Req() req: { user: { userId: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    return this.productsService.bulkUploadFromExcel(req.user.userId, file);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOneBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(req.user.userId, dto);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: editFileName,
      }),
    }),
  )

  uploadProductImages(
    @Req() req: { user: { userId: string; role: string } },
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.addImages(
      req.user.userId,
      req.user.role,
      id,
      files,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: { user: { userId: string; role: string } },
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.userId, req.user.role, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Req() req: { user: { userId: string; role: string } },
    @Param('id') id: string,
  ) {
    return this.productsService.remove(req.user.userId, req.user.role, id);
  }
}