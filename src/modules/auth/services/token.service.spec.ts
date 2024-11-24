import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/users/enums/role.enum';
import { UsersService } from '@/modules/users/services/users.service';

import { TokenService } from './token.service';

jest.mock('bcrypt', () => mockBcrypt());

const user: User = {
  id: 1,
  email: 'test@example.com',
  role: Role.USER,
  isEmailVerified: true,
  refreshToken: 'refreshToken',
} as User;

const userWithoutRefreshToken: User = { ...user, refreshToken: null } as User;

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useFactory: mockJwtService },
        {
          provide: UsersService,
          useFactory: mockUsersService,
        },
      ],
      imports: [ConfigModule],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('createTokens', () => {
    it('should create access and refresh tokens', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const tokens = await service.createTokens(user);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens for a valid user and valid refresh token', async () => {
      const mockRefreshToken = 'validRefreshToken';
      user.refreshToken = mockRefreshToken;
      const findOneByIdSpy = jest.spyOn(usersService, 'findOneById').mockResolvedValue(user);
      const verifyRefreshTokenSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(service as any, 'verifyRefreshToken')
        .mockResolvedValue(true);
      const storeRefreshTokenSpy = jest
        .spyOn(service, 'storeRefreshToken')
        .mockResolvedValue(undefined);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('newToken');

      const tokens = await service.refreshTokens(user.id, mockRefreshToken);

      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(findOneByIdSpy).toHaveBeenCalledWith(user.id, ['refreshToken']);
      expect(verifyRefreshTokenSpy).toHaveBeenCalledWith(mockRefreshToken, user.refreshToken);
      expect(storeRefreshTokenSpy).toHaveBeenCalledWith(user.id, tokens.refreshToken);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(null);

      await expect(service.refreshTokens(999, 'someRefreshToken')).rejects.toThrow(
        'User not found, or refresh token missing',
      );
    });

    it('should throw an error if user has no refresh token', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(userWithoutRefreshToken);

      await expect(service.refreshTokens(user.id, 'someRefreshToken')).rejects.toThrow(
        'User not found, or refresh token missing',
      );
    });

    it('should throw an error if refresh token is invalid', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(user);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service as any, 'verifyRefreshToken').mockResolvedValue(false);

      await expect(service.refreshTokens(user.id, 'invalidRefreshToken')).rejects.toThrow(
        'Refresh token is invalid',
      );
    });
  });

  describe('removeRefreshToken', () => {
    it('should remove the refresh token for a given user ID', async () => {
      const userId = 1;
      const updateSpy = jest.spyOn(usersService, 'update').mockResolvedValue(user);

      await service.removeRefreshToken(userId);

      expect(updateSpy).toHaveBeenCalledWith(userId, { refreshToken: null });
    });
  });

  describe('storeRefreshToken', () => {
    it('should hash the refresh token and store it using UsersService', async () => {
      const userId = 1;
      const refreshToken = 'some-refresh-token';
      const hashedRefreshToken = 'hashed-refresh-token';
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt = require('bcrypt');

      bcrypt.genSalt.mockResolvedValue('some-salt');
      bcrypt.hash.mockResolvedValue(hashedRefreshToken);
      const updateSpy = jest.spyOn(usersService, 'update').mockResolvedValue(user);

      await service.storeRefreshToken(userId, refreshToken);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(refreshToken, 'some-salt');
      expect(updateSpy).toHaveBeenCalledWith(userId, { refreshToken: hashedRefreshToken });
    });
  });

  describe('createAccessToken', () => {
    it('should create a valid access token for a given user', async () => {
      const userId = user.id;
      const email = user.email;
      const role = user.role;
      const isEmailVerified = user.isEmailVerified;

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('accessToken');

      const accessToken = await service['createAccessToken'](userId, email, role, isEmailVerified);

      expect(accessToken).toEqual('accessToken');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, email, role, isEmailVerified },
        {
          secret: service['jwtAccessSecret'],
          expiresIn: service['jwtAccessTokenExpirationTime'],
        },
      );
    });
  });

  describe('createRefreshToken', () => {
    it('should create a valid refresh token for a given user and store it', async () => {
      const userId = user.id;
      const email = user.email;
      const role = user.role;
      const isEmailVerified = user.isEmailVerified;

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('refreshToken');
      const storeRefreshTokenSpy = jest.spyOn(service, 'storeRefreshToken').mockResolvedValue();

      const refreshToken = await service['createRefreshToken'](
        userId,
        email,
        role,
        isEmailVerified,
      );

      expect(refreshToken).toEqual('refreshToken');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, email, role, isEmailVerified },
        {
          secret: service['jwtRefreshSecret'],
          expiresIn: service['jwtRefreshTokenExpirationTime'],
        },
      );
      expect(storeRefreshTokenSpy).toHaveBeenCalledWith(userId, 'refreshToken');
    });
  });
});

function mockBcrypt() {
  return {
    genSalt: jest.fn(),
    hash: jest.fn(),
  };
}

function mockJwtService() {
  return {
    signAsync: jest.fn(),
  };
}

function mockUsersService() {
  return {
    findOneById: jest.fn(),
    update: jest.fn(),
  };
}
