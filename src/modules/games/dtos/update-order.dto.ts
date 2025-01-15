import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class UpdateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  updates: OrderItem[];
}

class OrderItem {
  @IsNumber()
  id: number;

  @IsNumber()
  orderNumber: number;
}
