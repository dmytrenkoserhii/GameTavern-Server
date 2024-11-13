import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { VerificationService } from '../../users/services/verification.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { Tokens } from '../types/tokens.interface';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

const signUpDto: SignUpDto = { username: 'test', email: 'test@example.com', password: 'password' };
const signInDto: SignInDto = { email: 'test@example.com', password: 'password' };

const createTokensMockValue: Tokens = { accessToken: 'access', refreshToken: 'refresh' };

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let tokenService: TokenService;
  let verificationService: VerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useFactory: mockUsersService,
        },
        {
          provide: TokenService,
          useFactory: mockTokenService,
        },
        { provide: VerificationService, useFactory: mockVerificationService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    tokenService = module.get<TokenService>(TokenService);
    verificationService = module.get<VerificationService>(VerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should throw BadRequestException if user already exists', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(new User());

      await expect(service.signUp(signUpDto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully sign up a new user', async () => {
      const user = new User();

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockImplementation(async () => user);
      jest.spyOn(tokenService, 'createTokens').mockResolvedValue(createTokensMockValue);

      const result = await service.signUp(signUpDto);

      expect(result).toEqual(createTokensMockValue);
      expect(tokenService.createTokens).toHaveBeenCalledWith(user);
      expect(verificationService.sendVerificationLink).toHaveBeenCalledWith(signUpDto.email);
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      jest.spyOn(usersService, 'validateUser').mockImplementation(async () => new User());
      jest.spyOn(tokenService, 'createTokens').mockResolvedValue(createTokensMockValue);

      const result = await service.signIn(signInDto);

      expect(result).toEqual(createTokensMockValue);
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      const userId = 1;
      jest.spyOn(tokenService, 'removeRefreshToken').mockImplementation(async () => undefined);

      await service.logout(userId);

      expect(tokenService.removeRefreshToken).toHaveBeenCalledWith(userId);
    });
  });
});

function mockUsersService() {
  return {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    validateUser: jest.fn(),
  };
}

function mockTokenService() {
  return {
    createTokens: jest.fn(),
    removeRefreshToken: jest.fn(),
    storeRefreshToken: jest.fn(),
  };
}

function mockVerificationService() {
  return {
    sendVerificationLink: jest.fn(),
  };
}
