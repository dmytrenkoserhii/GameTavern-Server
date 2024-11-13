import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateAccountWithGoogleAuthDto } from '../dtos/create-account-with-google-auth.dto';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { UpdateAccountDto } from '../dtos/update-account.dto';
import { Account } from '../entities/account.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectRepository(Account)
    private accountService: Repository<Account>,
  ) {}

  public async findOneById(id: number): Promise<Account | null> {
    this.logger.log(`Finding account by ID: ${id}`);
    return this.accountService.findOne({
      where: { id },
    });
  }

  public async create(createAccountDto: CreateAccountDto, user: User): Promise<Account> {
    this.logger.log(`Creating account for user ID: ${user.id}`);
    const account = await this.accountService.create({
      ...createAccountDto,
      user,
    });

    return this.accountService.save(account);
  }

  public async createWithGoogleAuth(
    createAccountWithGoogleAuthDto: CreateAccountWithGoogleAuthDto,
    user: User,
  ): Promise<Account> {
    this.logger.log(`Creating Google Auth account for user ID: ${user.id}`);
    const account = await this.accountService.create({
      ...createAccountWithGoogleAuthDto,
      user,
    });

    return this.accountService.save(account);
  }

  public async update(id: number, updateAccountDto: UpdateAccountDto): Promise<Account> {
    this.logger.log(`Updating account ID: ${id}`);
    const account = await this.accountService.findOne({
      where: { id },
    });

    return this.accountService.save({ ...account, ...updateAccountDto });
  }
}
