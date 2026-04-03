import { IsOptional, IsString, Length } from 'class-validator';

export class BecomeSellerDto {
  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  middleName?: string;

  @IsString()
  @Length(1, 50)
  phone: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Length(1, 255)
  warehouseAddress: string;

  @IsString()
  @Length(2, 100)
  storeName: string;

  @IsOptional()
  @IsString()
  @Length(0, 600)
  storeDescription?: string;
}