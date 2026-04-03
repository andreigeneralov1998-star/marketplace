import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomepageBannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic() {
    return this.prisma.homepageBanner.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        openInNewTab: true,
        sortOrder: true,
      },
    });
  }
}