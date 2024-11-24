import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@/shared/shared.module';

import { UsersController } from './controllers/users.controller';
import { Account } from './entities/account.entity';
import { User } from './entities/user.entity';
import { AccountService } from './services/account.service';
import { UsersService } from './services/users.service';
import { VerificationService } from './services/verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account]), JwtModule, SharedModule],
  providers: [UsersService, AccountService, VerificationService],
  controllers: [UsersController],
  exports: [UsersService, AccountService, VerificationService],
})
export class UsersModule {}
