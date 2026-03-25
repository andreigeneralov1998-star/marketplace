import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class QueryOrdersDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status?: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

  @IsOptional()
  @IsIn(['EMS', 'EUROPOCHTA', 'BELPOCHTA', 'PICKUP_TOPSET'])
  deliveryMethod?: 'EMS' | 'EUROPOCHTA' | 'BELPOCHTA' | 'PICKUP_TOPSET';
}