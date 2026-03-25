import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stores')
  getStores() {
    return this.usersService.getStores();
  }

  @UseGuards(JwtAuthGuard)
  @Get('seller/profile')
  getMySellerProfile(@Req() req: any) {
    return this.usersService.getMySellerProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('seller/profile')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'store-logos'),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const isValid = allowed.test(file.mimetype);
        cb(isValid ? null : new Error('Разрешены только jpeg/jpg/png/webp'), isValid);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  updateMySellerProfile(
    @Req() req: any,
    @Body() dto: UpdateSellerProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const logoUrl = file ? `/uploads/store-logos/${file.filename}` : undefined;
    return this.usersService.updateMySellerProfile(req.user.userId, dto, logoUrl);
  }
}
