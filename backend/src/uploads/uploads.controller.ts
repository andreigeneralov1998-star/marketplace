import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Разрешены только JPG, PNG, WEBP'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    return {
      url: `/uploads/${file.filename}`,
    };
  }

  @Post('homepage-banner')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/homepage-banners',
        filename: (_, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Разрешены только JPG, PNG, WEBP'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadHomepageBanner(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    return {
      url: `/uploads/homepage-banners/${file.filename}`,
    };
  }
}