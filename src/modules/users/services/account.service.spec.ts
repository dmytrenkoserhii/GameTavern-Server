import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CreateAccountWithGoogleAuthDto } from '../dtos/create-account-with-google-auth.dto';
import { UpdateAccountDto } from '../dtos/update-account.dto';
import { Account } from '../entities/account.entity';
import { User } from '../entities/user.entity';
import { CreateAccountDto } from './../dtos/create-account.dto';
import { AccountService } from './account.service';

const mockUser: Partial<User> = {
  id: 1,
};

const mockAccount: Account = {
  id: 1,
  username: 'mockUsername',
  firstName: 'Mock',
  lastName: 'User',
  age: 30,
  weight: 70.5,
  height: 175.3,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Account;

const createAccountDto: CreateAccountDto = {
  username: 'mockUsername',
  firstName: 'Mock',
  lastName: 'User',
  age: 30,
  weight: 70.5,
  height: 175.3,
};

const createAccountWithGoogleAuthDto: CreateAccountWithGoogleAuthDto = {
  firstName: 'Mock',
  lastName: 'User',
};

const updateAccountDto: UpdateAccountDto = {
  username: 'updatedUsername',
  firstName: 'Updated',
  lastName: 'User',
  age: 31,
  weight: 71.5,
  height: 176.3,
};

const updatedAccount: Account = {
  ...mockAccount,
  ...updateAccountDto,
  checkIfFullyFilled: jest.fn(),
};

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: Repository<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: getRepositoryToken(Account), useFactory: mockAccountRepository },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountRepository = module.get<Repository<Account>>(getRepositoryToken(Account));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(accountRepository).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return an account by ID', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(mockAccount);

      expect(await service.findOneById(1)).toEqual(mockAccount);
      expect(accountRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('create', () => {
    it('should successfully create an account', async () => {
      jest.spyOn(accountRepository, 'create').mockReturnValue(mockAccount);
      jest.spyOn(accountRepository, 'save').mockResolvedValue(mockAccount);

      expect(await service.create(createAccountDto, mockUser as User)).toEqual(mockAccount);
      expect(accountRepository.create).toHaveBeenCalledWith({
        ...createAccountDto,
        user: mockUser as User,
      });
      expect(accountRepository.save).toHaveBeenCalledWith(mockAccount);
    });
  });

  describe('createWithGoogleAuth', () => {
    it('should successfully create an account with Google Auth', async () => {
      jest.spyOn(accountRepository, 'create').mockReturnValue(mockAccount);
      jest.spyOn(accountRepository, 'save').mockResolvedValue(mockAccount);

      expect(
        await service.createWithGoogleAuth(createAccountWithGoogleAuthDto, mockUser as User),
      ).toEqual(mockAccount);
      expect(accountRepository.create).toHaveBeenCalledWith({
        ...createAccountWithGoogleAuthDto,
        user: mockUser as User,
      });
      expect(accountRepository.save).toHaveBeenCalledWith(mockAccount);
    });
  });

  describe('update', () => {
    it('should update an account', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(mockAccount);
      jest.spyOn(accountRepository, 'save').mockResolvedValue(updatedAccount);

      expect(await service.update(1, updateAccountDto)).toEqual(updatedAccount);
      expect(accountRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(accountRepository.save).toHaveBeenCalledWith({ ...mockAccount, ...updateAccountDto });
    });
  });
});

function mockAccountRepository() {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
}
