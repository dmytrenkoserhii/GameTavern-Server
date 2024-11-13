import { IsBoolean, IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { User } from '../entities/user.entity';

export class UpdateUserDto implements Partial<User> {
  @IsOptional()
  @IsString()
  @IsEmail()
  @ApiPropertyOptional({ description: 'Email of the user', example: 'john.doe@example.com' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Refresh token for the user session',
    example: 'refresh_token_here',
  })
  refreshToken?: string | null;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Indicates if the user profile is fully filled',
    example: false,
  })
  isFullyFilled?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Indicates if the user email is verified', example: false })
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Token for resetting password', example: 'reset_token_here' })
  resetPasswordToken?: string | null;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({
    description: 'Expiration date for the reset password token',
    type: 'string',
    format: 'date-time',
  })
  resetPasswordTokenExpiresAt?: Date | null;
}
