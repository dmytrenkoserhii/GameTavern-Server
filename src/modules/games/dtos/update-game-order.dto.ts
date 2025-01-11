import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

class GameOrderItem {
  @IsNumber()
  id: number;

  @IsNumber()
  orderNumber: number;
}

export class UpdateGameOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameOrderItem)
  updates: GameOrderItem[];
}
