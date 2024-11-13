/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { GoogleAuthPayload } from '../types/google-auth-payload.interface';
import { JwtAccessPayload } from '../types/jwt-access-payload.interface';
import { JwtRefreshPayload } from '../types/jwt-refresh-payload.interface';
import { AuthController } from './auth.controller';

import { Role } from 'src/modules/users/enums/role.enum';
import { UsersService } from 'src/modules/users/services/users.service';
import { CookiesKeys } from 'src/shared/enums/cookies-keys.enum';
import { TimePeriods } from 'src/shared/enums/time-periods.enum';
import { CookiesService } from 'src/shared/services/cookies.service';

// TODO: check the correct way to test controllers. Test all other controllers.
describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let cookiesService: CookiesService;
  let tokenService: TokenService;
  let usersService: UsersService;
  let authController: AuthController;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    logout: jest.fn(),
  };

  const mockCookiesService = {
    setCookie: jest.fn(),
    removeCookie: jest.fn(),
  };

  const mockTokenService = {
    refreshTokens: jest.fn(),
  };

  const mockUsersService = {
    sendPasswordResetEmail: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CookiesService, useValue: mockCookiesService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    cookiesService = moduleFixture.get<CookiesService>(CookiesService);
    tokenService = moduleFixture.get<TokenService>(TokenService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    authController = moduleFixture.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AuthController - signUp', () => {
    const signUpDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    beforeEach(() => {
      mockAuthService.signUp.mockResolvedValue(mockTokens);
      mockCookiesService.setCookie.mockClear();
    });

    it('should sign up a new user and set authentication cookies', async () => {
      const mockResponse: Partial<Response> = {
        cookie: jest.fn(),
      };

      await authController.signUp(signUpDto, mockResponse as Response);

      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.ACCESS_TOKEN,
        mockTokens.accessToken,
        TimePeriods.HOUR,
      );
      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.REFRESH_TOKEN,
        mockTokens.refreshToken,
        TimePeriods.WEEK,
      );
    });
  });

  describe('AuthController - signIn', () => {
    const signInDto = {
      email: 'user@example.com',
      password: 'strongPassword123',
    };

    const mockTokens = {
      accessToken: 'access-token-example',
      refreshToken: 'refresh-token-example',
    };

    beforeEach(() => {
      mockAuthService.signIn.mockResolvedValue(mockTokens);
      mockCookiesService.setCookie.mockClear();
    });

    it('should sign in an existing user and set authentication cookies', async () => {
      const mockResponse: Partial<Response> = {
        cookie: jest.fn(),
      };

      await authController.signIn(signInDto, mockResponse as Response);

      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.ACCESS_TOKEN,
        mockTokens.accessToken,
        TimePeriods.HOUR,
      );
      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.REFRESH_TOKEN,
        mockTokens.refreshToken,
        TimePeriods.WEEK,
      );
    });

    it('should handle exceptions thrown by authService.signIn', async () => {
      mockAuthService.signIn.mockRejectedValue(new Error('Invalid credentials'));

      const mockResponse: Partial<Response> = {
        cookie: jest.fn(),
      };

      await expect(authController.signIn(signInDto, mockResponse as Response)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      // Ensure no cookies are set if signIn fails
      expect(cookiesService.setCookie).not.toHaveBeenCalled();
    });
  });

  describe('AuthController - refreshTokens', () => {
    const jwtRefreshPayload: JwtRefreshPayload = {
      sub: 1234567890,
      refreshToken: 'initial-refresh-token',
      email: 'user@example.com',
      role: Role.USER,
      isEmailVerified: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    const newTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    beforeEach(() => {
      mockTokenService.refreshTokens.mockResolvedValue(newTokens);
      mockCookiesService.setCookie.mockClear();
    });

    it('should refresh tokens and set authentication cookies', async () => {
      const mockResponse: Partial<Response> = {
        cookie: jest.fn(),
      };

      await authController.refreshTokens(jwtRefreshPayload, mockResponse as Response);

      expect(tokenService.refreshTokens).toHaveBeenCalledWith(
        jwtRefreshPayload.sub,
        jwtRefreshPayload.refreshToken,
      );
      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.ACCESS_TOKEN,
        newTokens.accessToken,
        TimePeriods.HOUR,
      );
      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.REFRESH_TOKEN,
        newTokens.refreshToken,
        TimePeriods.WEEK,
      );
    });

    it('should handle exceptions thrown by tokenService.refreshTokens', async () => {
      mockTokenService.refreshTokens.mockRejectedValue(new Error('Refresh token invalid'));

      const mockResponse: Partial<Response> = {
        cookie: jest.fn(),
      };

      await expect(
        authController.refreshTokens(jwtRefreshPayload, mockResponse as Response),
      ).rejects.toThrow('Refresh token invalid');

      expect(tokenService.refreshTokens).toHaveBeenCalledWith(
        jwtRefreshPayload.sub,
        jwtRefreshPayload.refreshToken,
      );

      expect(cookiesService.setCookie).not.toHaveBeenCalled();
    });
  });

  describe('AuthController - logout', () => {
    const jwtAccessPayload: JwtAccessPayload = {
      sub: 1234567890,
      email: 'user@example.com',
      role: Role.USER,
      isEmailVerified: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    beforeEach(() => {
      mockAuthService.logout.mockResolvedValue(undefined);
      mockCookiesService.removeCookie.mockClear();
    });

    it('should log out the current user and remove authentication cookies', async () => {
      const mockResponse: Partial<Response> = {
        clearCookie: jest.fn(),
      };

      await authController.logout(jwtAccessPayload, mockResponse as Response);

      expect(authService.logout).toHaveBeenCalledWith(jwtAccessPayload.sub);
      expect(cookiesService.removeCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.ACCESS_TOKEN,
      );
      expect(cookiesService.removeCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.REFRESH_TOKEN,
      );
    });
  });

  describe('AuthController - googleAuthRedirect', () => {
    const googleAuthPayload: GoogleAuthPayload = {
      id: 0,
      email: 'user@example.com',
      hashedPassword: null,
      role: Role.USER,
      isAccountFilled: false,
      refreshToken: 'refresh-token-example',
      oauthId: null,
      isEmailVerified: false,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      account: {} as any,
      programs: [],
      accessToken: 'access-token-example',
      validatePassword: jest.fn(),
    };

    beforeEach(() => {
      mockCookiesService.setCookie.mockClear();
    });

    it('should set authentication cookies and redirect after Google authentication', async () => {
      const mockResponse: Partial<Response> = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      };

      await authController.googleAuthRedirect(googleAuthPayload, mockResponse as Response);

      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.ACCESS_TOKEN,
        googleAuthPayload.accessToken,
        TimePeriods.HOUR,
      );
      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        mockResponse,
        CookiesKeys.REFRESH_TOKEN,
        googleAuthPayload.refreshToken,
        TimePeriods.WEEK,
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:3000');
    });
  });

  describe('AuthController - forgotPassword', () => {
    const forgotPasswordDto = {
      email: 'test@example.com',
    };

    beforeEach(() => {
      mockUsersService.sendPasswordResetEmail.mockClear();
    });

    it('should request a password reset link for the user', async () => {
      await authController.forgotPassword(forgotPasswordDto);

      expect(usersService.sendPasswordResetEmail).toHaveBeenCalledWith(forgotPasswordDto);
    });

    it('should handle exceptions thrown by usersService.sendPasswordResetEmail', async () => {
      mockUsersService.sendPasswordResetEmail.mockRejectedValue(new Error('User not found'));

      await expect(authController.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        'User not found',
      );

      expect(mockUsersService.sendPasswordResetEmail).toHaveBeenCalledWith(forgotPasswordDto);
    });
  });

  describe('AuthController - resetPassword', () => {
    const resetPasswordDto = {
      token: 'reset-token',
      password: 'newStrongPassword123',
    };

    beforeEach(() => {
      mockUsersService.resetPassword.mockClear();
    });

    it('should reset the user password', async () => {
      await authController.resetPassword(resetPasswordDto);

      expect(usersService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });

    it('should handle exceptions thrown by usersService.resetPassword', async () => {
      mockUsersService.resetPassword.mockRejectedValue(new Error('Reset token invalid or expired'));

      await expect(authController.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Reset token invalid or expired',
      );

      expect(usersService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });
});
