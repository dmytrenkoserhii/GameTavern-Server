import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { Account } from '../entities/account.entity';

export class CreateAccountWithGoogleAuthDto implements Partial<Account> {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'First name of the user', example: 'John' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  lastName: string;
}
