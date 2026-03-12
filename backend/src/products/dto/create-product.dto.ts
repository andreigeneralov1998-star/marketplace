import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  description!: string;

  @IsOptional()
  specs?: Record<string, unknown>;

  @IsNumber()
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  sku!: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];
}