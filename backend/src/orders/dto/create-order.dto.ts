import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  fullName!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}