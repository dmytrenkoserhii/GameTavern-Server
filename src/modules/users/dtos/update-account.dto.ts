import { IsOptional, IsString } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { Account } from '../entities/account.entity';

export class UpdateAccountDto implements Partial<Account> {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Username of the account',
    example: 'johndoe123',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'First name of the account holder',
    example: 'John',
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Last name of the account holder',
    example: 'Doe',
  })
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Birth date of the account holder',
    example: '1990-01-15',
  })
  birthDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Avatar URL of the account holder',
    example: 'https://example.com/avatars/johndoe.jpg',
  })
  avatar?: string;
}
