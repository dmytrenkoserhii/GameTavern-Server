import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class GameRecommendationsDto {
  @ApiProperty({
    example: ['The Witcher 3', 'Red Dead Redemption 2'],
    description: 'A list of games to base recommendations on',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  games: string[];

  @ApiProperty({
    example: ['God of War', 'Horizon Zero Dawn'],
    description: 'Previously recommended games to exclude',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  existingRecommendations?: string[] = [];
}
