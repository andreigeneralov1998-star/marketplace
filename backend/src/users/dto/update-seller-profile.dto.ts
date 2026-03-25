import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSellerProfileDto {
  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  middleName: string;

  @IsString()
  @MaxLength(30)
  phone: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(255)
  warehouseAddress: string;

  @IsString()
  @MaxLength(120)
  storeName: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  storeDescription?: string;
}