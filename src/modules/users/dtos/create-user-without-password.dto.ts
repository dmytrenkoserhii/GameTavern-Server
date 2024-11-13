import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from '../entities/user.entity';

export class CreateUserWithoutPasswordDto implements Partial<User> {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'Email of the user', example: 'john.doe@example.com' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'OAuth ID for the user', example: 'oauthId123' })
  oauthId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Refresh token for the user session',
    example: 'refresh_token_here',
  })
  refreshToken?: string;
}
