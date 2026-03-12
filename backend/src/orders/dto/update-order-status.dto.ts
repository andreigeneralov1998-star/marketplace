import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status!: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}