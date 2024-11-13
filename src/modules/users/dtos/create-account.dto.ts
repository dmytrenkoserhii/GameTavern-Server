import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { Account } from '../entities/account.entity';

export class CreateAccountDto implements Partial<Account> {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Username of the account',
    example: 'johndoe123',
  })
  username: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'First name of the account holder',
    required: false,
    example: 'John',
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Last name of the account holder',
    required: false,
    example: 'Doe',
  })
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Biography of the account holder',
    required: false,
    example: 'Software developer and tech enthusiast.',
  })
  biography?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Birth date of the account holder',
    required: false,
    example: '1990-01-15',
  })
  birthDate?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the account holder',
    required: false,
    example: '+1234567890',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Avatar URL of the account holder',
    required: false,
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;
}
