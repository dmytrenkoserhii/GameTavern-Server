import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';

import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ResetPasswordDto } from '../../auth/dtos/reset-password.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';

import { ForgotPasswordDto } from '@/modules/auth/dtos/forgot-passowrd.dto';
import { SignUpDto } from '@/modules/auth/dtos/sign-up.dto';
import { EmailService } from '@/shared/services/email.service';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

const usersArray: User[] = [
  { id: 1, email: 'user1@example.com' },
  { id: 2, email: 'user2@example.com' },
] as User[];

const signUpDto: SignUpDto = {
  email: 'test@example.com',
  password: 'TestPassword123',
};

const updateData: UpdateUserDto = { email: 'updated@example.com' };

const resetPasswordDto: ResetPasswordDto = { token: 'reset-token', password: 'newPassword123' };

const forgotPasswordDto: ForgotPasswordDto = { email: 'test@example.com' };

const user: User = {
  id: 1,
  email: 'user@example.com',
  resetPasswordToken: resetPasswordDto.token,
  resetPasswordTokenExpiresAt: new Date(Date.now() + 10000),
  hashedPassword: 'initialHashedPassword',
} as User;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let emailService: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUsersRepository },
        { provide: EmailService, useFactory: mockEmailService },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(emailService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('create', () => {
    const hashedPassword = 'hashed-refresh-token';

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt = require('bcrypt');

      bcrypt.genSalt.mockResolvedValue('some-salt');
      bcrypt.hash.mockResolvedValue(hashedPassword);
    });

    it('should successfully create a user', async () => {
      const expectedUser = {
        ...signUpDto,
        id: 1,
        hashedPassword,
      };

      jest.spyOn(userRepository, 'create').mockReturnValue(expectedUser as unknown as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(expectedUser as unknown as User);

      const result = await service.create(signUpDto);

      expect(userRepository.create).toHaveBeenCalledWith({
        ...signUpDto,
        hashedPassword: expect.any(String),
      });
      expect(userRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it('should hash the password before saving the user', async () => {
      const expectedUser = {
        ...signUpDto,
        id: 1,
        hashedPassword,
      };

      jest.spyOn(userRepository, 'create').mockReturnValue(expectedUser as unknown as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(expectedUser as unknown as User);

      const user = await service.create(signUpDto);

      expect(user.hashedPassword).not.toEqual(signUpDto.password);
      expect(user.hashedPassword).toBeDefined();
    });

    it('should log a message on successful creation', async () => {
      const expectedUser = {
        ...signUpDto,
        id: 1,
        hashedPassword: expect.any(String),
      };

      jest.spyOn(userRepository, 'create').mockReturnValue(expectedUser as unknown as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(expectedUser as unknown as User);

      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await service.create(signUpDto);

      expect(loggerSpy).toHaveBeenCalledWith(
        `User with email: ${signUpDto.email} created successfully`,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue(usersArray as User[]);

      const result = await service.findAll();

      expect(result).toEqual(usersArray);
      expect(userRepository.find).toHaveBeenCalled();
    });

    it('should log a message when fetching all users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue(usersArray as User[]);
      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await service.findAll();

      expect(loggerSpy).toHaveBeenCalledWith('Fetching all users');
    });
  });

  describe('findOneById', () => {
    it('should return a user if found', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      } as unknown as SelectQueryBuilder<User>);

      const result = await service.findOneById(user.id);

      expect(result).toEqual(user);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as unknown as SelectQueryBuilder<User>);

      const result = await service.findOneById(user.id);

      expect(result).toBeNull();
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    });

    it('should include specified fields in the query if provided', async () => {
      const fieldsToInclude = ['hashedPassword'];

      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as unknown as SelectQueryBuilder<User>);

      const result = await service.findOneById(user.id, fieldsToInclude);

      expect(result).toEqual(user);
      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith(`user.${fieldsToInclude[0]}`);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if found', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      } as unknown as SelectQueryBuilder<User>);

      const result = await service.findOneByEmail(user.email);

      expect(result).toEqual(user);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as unknown as SelectQueryBuilder<User>);

      const result = await service.findOneByEmail(user.email);

      expect(result).toBeNull();
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    });

    it('should include specified fields in the query if provided', async () => {
      const fieldsToInclude = ['hashedPassword'];

      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as unknown as SelectQueryBuilder<User>);

      const result = await service.findOneByEmail(user.email, fieldsToInclude);

      expect(result).toEqual(user);
      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith(`user.${fieldsToInclude[0]}`);
    });
  });

  describe('findOneByOAuthId', () => {
    it('should return a user if found by OAuth ID', async () => {
      const oauthId = 'some-oauth-id';
      const mockedUser = { ...user, oauthId };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockedUser as User);

      const result = await service.findOneByOAuthId(oauthId);

      expect(result).toEqual(mockedUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ oauthId });
    });

    it('should return null if no user is found with the given OAuth ID', async () => {
      const oauthId = 'nonexistent-oauth-id';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.findOneByOAuthId(oauthId);

      expect(result).toBeNull();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ oauthId });
    });
  });

  describe('update', () => {
    it('should successfully update a user', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(user as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...user,
        ...updateData,
      } as unknown as User);

      const result = await service.update(user.id, updateData);

      expect(result).toEqual({ ...user, ...updateData });
      expect(service.findOneById).toHaveBeenCalledWith(user.id);
      expect(userRepository.save).toHaveBeenCalledWith({ ...user, ...updateData });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null);

      await expect(service.update(user.id, updateData)).rejects.toThrow(NotFoundException);
      expect(service.findOneById).toHaveBeenCalledWith(user.id);
    });
  });

  describe('deleteById', () => {
    it('should successfully delete a user by ID', async () => {
      const deleteResult = { affected: 1 };

      jest
        .spyOn(userRepository, 'delete')
        .mockResolvedValue(deleteResult as unknown as DeleteResult);

      const loggerSpy = jest.spyOn(service['logger'], 'log');

      const result = await service.deleteById(user.id);

      expect(result).toEqual(deleteResult);
      expect(userRepository.delete).toHaveBeenCalledWith(user.id);
      expect(loggerSpy).toHaveBeenCalledWith(`Deleting user with ID: ${user.id}`);
    });
  });

  describe('validateUser', () => {
    const userEmail = 'test@example.com';
    const userPassword = 'TestPassword123';
    const hashedPassword = 'hashedPassword123';

    it('should validate a user with correct credentials', async () => {
      const mockedUser = { ...user, email: userEmail, hashedPassword };

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt = require('bcrypt');

      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(mockedUser as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(userEmail, userPassword);

      expect(service.findOneByEmail).toHaveBeenCalledWith(userEmail, ['hashedPassword']);
      expect(bcrypt.compare).toHaveBeenCalledWith(userPassword, hashedPassword);
      expect(result).toEqual(mockedUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.validateUser(userEmail, userPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.findOneByEmail).toHaveBeenCalledWith(userEmail, ['hashedPassword']);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = { ...user, hashedPassword };

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt = require('bcrypt');

      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.validateUser(userEmail, userPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(userPassword, hashedPassword);
    });

    it('should throw UnauthorizedException if user has no hashedPassword', async () => {
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(user as User);

      await expect(service.validateUser(userEmail, userPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.sendPasswordResetEmail(forgotPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOneByEmail).toHaveBeenCalledWith(forgotPasswordDto.email, ['oauthId']);
    });

    it('should inform user to sign in using Google if signed up with Google OAuth', async () => {
      const mockedUser = { ...user, email: forgotPasswordDto.email, oauthId: 'some-oauth-id' };
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(mockedUser as User);
      const emailSendSpy = jest.spyOn(emailService, 'send').mockResolvedValue();

      await service.sendPasswordResetEmail(forgotPasswordDto);

      expect(emailSendSpy).toHaveBeenCalledWith({
        to: forgotPasswordDto.email,
        from: expect.any(String),
        subject: 'Sign in using Google',
        html: expect.stringContaining('Please continue to sign in using Google'),
      });
    });

    it('should send a password reset email to a regular user', async () => {
      const mockedUser = { ...user, email: forgotPasswordDto.email };
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(mockedUser as User);
      jest.spyOn(service, 'update').mockResolvedValue(mockedUser as User);
      const emailSendSpy = jest.spyOn(emailService, 'send').mockResolvedValue();

      await service.sendPasswordResetEmail(forgotPasswordDto);

      expect(service.update).toHaveBeenCalled();
      expect(emailSendSpy).toHaveBeenCalledWith({
        to: forgotPasswordDto.email,
        from: expect.any(String),
        subject: 'Password Reset',
        html: expect.stringContaining('Please use the following link to reset your password'),
      });
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is invalid or expired', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        resetPasswordToken: resetPasswordDto.token,
        resetPasswordTokenExpiresAt: expect.any(Object),
      });
    });

    it('should successfully reset the password', async () => {
      const originalUser = { ...user };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as unknown as User);
      const saveSpy = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...user, hashedPassword: 'newHashedPassword' } as unknown as User);

      await service.resetPassword(resetPasswordDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        resetPasswordToken: resetPasswordDto.token,
        resetPasswordTokenExpiresAt: expect.any(Object),
      });
      expect(saveSpy).toHaveBeenCalled();
      const savedUser = saveSpy.mock.calls[0][0];
      expect(savedUser.hashedPassword).not.toBe(originalUser.hashedPassword);
      expect(savedUser.resetPasswordToken).toBeNull();
      expect(savedUser.resetPasswordTokenExpiresAt).toBeNull();
    });

    it('should throw InternalServerErrorException on save error', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as User);
      jest.spyOn(userRepository, 'save').mockRejectedValue(new Error('Save error'));

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

function mockEmailService() {
  return {
    send: jest.fn(),
  };
}

function mockConfigService() {
  return {
    get: jest.fn((key) => {
      switch (key) {
        case 'CLIENT_URL':
          return 'http://localhost:3000';
        case 'EMAIL_SEND_FROM':
          return 'noreply@example.com';
        default:
          return null;
      }
    }),
  };
}

function mockUsersRepository() {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };
}
