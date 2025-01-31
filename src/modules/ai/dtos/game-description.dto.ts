import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class GameDescriptionDto {
  @ApiProperty({
    description: 'Description of the games user is looking for',
    example: 'game with snow and dragons',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
