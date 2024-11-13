import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Token for email confirmation', example: 'token123' })
  token: string;
}
