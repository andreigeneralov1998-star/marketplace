import { Module } from '@nestjs/common';
import { HomepageBannersController } from './homepage-banners.controller';
import { HomepageBannersService } from './homepage-banners.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [HomepageBannersController],
  providers: [HomepageBannersService, PrismaService],
  exports: [HomepageBannersService],
})
export class HomepageBannersModule {}