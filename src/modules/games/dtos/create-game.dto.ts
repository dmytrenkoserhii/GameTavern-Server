import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  gameApiId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  listId: number;
}
