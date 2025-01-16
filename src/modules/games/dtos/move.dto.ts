import { IsNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class MoveDto {
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  targetListId: number;
}
