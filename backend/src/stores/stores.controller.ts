import { Controller, Get, Param } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':storeSlug')
  findOne(@Param('storeSlug') storeSlug: string) {
    return this.storesService.findOneBySlug(storeSlug);
  }

  @Get(':storeSlug/products')
  findProducts(@Param('storeSlug') storeSlug: string) {
    return this.storesService.findStoreProducts(storeSlug);
  }
}