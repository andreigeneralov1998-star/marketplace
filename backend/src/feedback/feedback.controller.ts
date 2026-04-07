import { Body, Controller, Get, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(@Body() dto: CreateFeedbackDto) {
    const item = await this.feedbackService.create(dto);

    return {
      success: true,
      message: 'Обращение успешно отправлено',
      data: item,
    };
  }

  @Get()
  async findAll() {
    return this.feedbackService.findAll();
  }
}