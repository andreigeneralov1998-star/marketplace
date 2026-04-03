import { Controller, Get } from '@nestjs/common';
import { HomepageBannersService } from './homepage-banners.service';

@Controller('homepage-banners')
export class HomepageBannersController {
  constructor(
    private readonly homepageBannersService: HomepageBannersService,
  ) {}

  @Get()
  findPublic() {
    return this.homepageBannersService.findPublic();
  }
}