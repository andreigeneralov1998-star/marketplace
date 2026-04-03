import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(100, { message: 'Наименование товара должно быть не более 100 символов' })
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Артикул должен быть не более 50 символов' })
  sku?: string;

  @IsString()
  categoryId!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть меньше 0' })
  price!: number;

  @Type(() => Number)
  @IsInt({ message: 'Наличие должно быть целым числом' })
  @Min(0, { message: 'Наличие не может быть меньше 0' })
  stock!: number;

  @IsString()
  @MaxLength(600, { message: 'Описание должно быть не более 600 символов' })
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Совместимые модели должны быть не более 20 символов' })
  compatibleModels?: string;

  @IsOptional()
  specs?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: 'Можно загрузить не более 3 фото' })
  imageUrls?: string[];
}