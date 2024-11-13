import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../../../shared/services/email.service';
import { ConfirmEmailDto } from '../dtos/confirm-email.dto';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { VerificationService } from './verification.service';

describe('VerificationService', () => {
  let service: VerificationService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailService: EmailService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: JwtService, useFactory: mockJwtService },
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: EmailService, useFactory: mockEmailService },
        { provide: UsersService, useFactory: mockUsersService },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
    expect(emailService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('sendVerificationLink', () => {
    it('should successfully send a verification link', async () => {
      const email = 'test@example.com';
      await service.sendVerificationLink(email);

      expect(jwtService.sign).toHaveBeenCalled();
      expect(emailService.send).toHaveBeenCalledWith({
        to: email,
        from: 'noreply@example.com',
        subject: 'Email confirmation',
        text: expect.stringContaining('http://localhost:3000/confirm-email?token=mockToken'),
      });
    });

    it('should log the sending process', async () => {
      const email = 'test@example.com';
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      await service.sendVerificationLink(email);

      expect(loggerSpy).toHaveBeenCalledWith(`Sending verification link to ${email}`);
      expect(loggerSpy).toHaveBeenCalledWith(`Verification link sent to ${email}`);
    });
  });

  describe('resendConfirmationLink', () => {
    it('should throw NotFoundException if user is not found', async () => {
      await expect(service.resendConfirmationLink(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if email is already verified', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        isEmailVerified: true,
      } as User);
      await expect(service.resendConfirmationLink(1)).rejects.toThrow(BadRequestException);
    });

    it('should successfully resend the confirmation link', async () => {
      const sendVerificationLinkSpy = jest.spyOn(service, 'sendVerificationLink');

      await service.resendConfirmationLink(1);

      expect(sendVerificationLinkSpy).toHaveBeenCalledWith('user@example.com');
      expect(sendVerificationLinkSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirmEmail', () => {
    let confirmEmailDto: ConfirmEmailDto;

    beforeEach(() => {
      confirmEmailDto = { token: 'validToken' };
      jest.clearAllMocks(); // Clear previous mocks between tests
    });

    it('should confirm the email successfully', async () => {
      jest.spyOn(jwtService, 'verify').mockResolvedValue({ email: 'valid@example.com' } as never);
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({
        id: 1,
        email: 'valid@example.com',
        isEmailVerified: false,
      } as User);
      const updateSpy = jest.spyOn(usersService, 'update').mockResolvedValue({
        id: 1,
        email: 'valid@example.com',
        isEmailVerified: true,
      } as User);

      await service.confirmEmail(confirmEmailDto);

      expect(updateSpy).toHaveBeenCalledWith(1, { isEmailVerified: true });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest
        .spyOn(jwtService, 'verify')
        .mockResolvedValue({ email: 'nonexistent@example.com' } as never);
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.confirmEmail(confirmEmailDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if email is already verified', async () => {
      jest
        .spyOn(jwtService, 'verify')
        .mockResolvedValue({ email: 'verified@example.com' } as never);
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({
        id: 2,
        email: 'verified@example.com',
        isEmailVerified: true,
      } as User);

      await expect(service.confirmEmail(confirmEmailDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new BadRequestException('Bad confirmation token');
      });

      await expect(service.confirmEmail({ token: 'invalidToken' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token is expired', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new BadRequestException('Email confirmation token expired');
      });

      await expect(service.confirmEmail({ token: 'expiredToken' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

function mockJwtService() {
  return {
    sign: jest.fn().mockReturnValue('mockToken'),
    verify: jest.fn(),
  };
}

function mockConfigService() {
  return {
    get: jest.fn((key) => {
      switch (key) {
        case 'JWT_VERIFICATION_TOKEN_SECRET':
          return 'secret';
        case 'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME':
          return '3600s';
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

function mockEmailService() {
  return {
    send: jest.fn(),
  };
}

function mockUsersService() {
  return {
    findOneById: jest.fn().mockImplementation((id) => {
      if (id === 1) {
        return Promise.resolve({ id: 1, email: 'user@example.com', isEmailVerified: false });
      } else {
        return Promise.resolve(null);
      }
    }),
    findOneByEmail: jest.fn().mockImplementation((email) => {
      if (email === 'existing@example.com') {
        return Promise.resolve({ id: 1, email, isEmailVerified: false });
      } else {
        return Promise.resolve(null);
      }
    }),
    update: jest.fn(),
  };
}
