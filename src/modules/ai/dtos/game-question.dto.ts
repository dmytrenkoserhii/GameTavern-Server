import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class GameQuestionDto {
  @ApiProperty({
    description: 'Name of the game to ask about',
    example: 'The Witcher 3: Wild Hunt',
  })
  @IsString()
  @IsNotEmpty()
  gameName: string;

  @ApiProperty({
    description: 'Question about the game',
    example: 'How long does it take to beat',
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}
