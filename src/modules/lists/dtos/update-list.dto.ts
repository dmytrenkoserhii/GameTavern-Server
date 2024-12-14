import { IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateListDto {
  @ApiProperty({ example: 'My Favorite Games', required: false })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'A collection of my favorite games', required: false })
  @IsString()
  @MaxLength(255)
  description?: string;
}
