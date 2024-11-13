import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The reset token received via email', example: 'reset_token_123' })
  token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The new password', example: 'newStrongPassword1!' })
  password: string;
}
