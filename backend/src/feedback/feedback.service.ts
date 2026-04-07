import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto) {
    return this.prisma.feedbackMessage.create({
      data: {
        name: dto.name.trim(),
        contact: dto.contact.trim(),
        message: dto.message.trim(),
      },
    });
  }

  async findAll() {
    return this.prisma.feedbackMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}