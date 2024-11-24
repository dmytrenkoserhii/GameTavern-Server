import * as bcrypt from 'bcrypt';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/users/enums/role.enum';

import { ENV } from '../../../shared/enums/env.enum';
import { Tokens } from '../types/tokens.interface';
import { UsersService } from './../../users/services/users.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly jwtAccessSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtAccessTokenExpirationTime: string;
  private readonly jwtRefreshTokenExpirationTime: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.jwtAccessSecret = this.configService.get<string>(ENV.JWT_ACCESS_SECRET, '');
    this.jwtRefreshSecret = this.configService.get<string>(ENV.JWT_REFRESH_SECRET, '');
    this.jwtAccessTokenExpirationTime = this.configService.get<string>(
      ENV.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      '',
    );
    this.jwtRefreshTokenExpirationTime = this.configService.get<string>(
      ENV.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      '',
    );
  }

  public async createTokens(user: User): Promise<Tokens> {
    this.logger.log(`Creating tokens for user with ID: ${user.id}`);

    const accessToken = await this.createAccessToken(
      user.id,
      user.email,
      user.role,
      user.isEmailVerified,
    );

    const refreshToken = await this.createRefreshToken(
      user.id,
      user.email,
      user.role,
      user.isEmailVerified,
    );

    this.logger.log(`Tokens created for user with ID: ${user.id}`);
    return { accessToken, refreshToken };
  }

  public async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<{ tokens: Tokens; user: User }> {
    this.logger.log(`Refreshing tokens for user with ID: ${userId}`);

    const user = await this.usersService.findOneById(userId, ['refreshToken']);
    if (!user || !user.refreshToken) {
      throw new Error('User not found, or refresh token missing');
    }

    const isValid = await this.verifyRefreshToken(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new Error('Refresh token is invalid');
    }

    const tokens = await this.createTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`Tokens refreshed for user with ID: ${userId}`);
    return { user, tokens };
  }

  public async removeRefreshToken(userId: number): Promise<void> {
    this.logger.log(`Removing refresh token for user with ID: ${userId}`);
    await this.usersService.update(userId, { refreshToken: null });
    this.logger.log(`Refresh token removed for user with ID: ${userId}`);
  }

  public async storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    this.logger.log(`Storing refresh token for user with ID: ${userId}`);

    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });

    this.logger.log(`Refresh token stored for user with ID: ${userId}`);
  }

  private async createAccessToken(
    userId: number,
    email: string,
    role: Role,
    isEmailVerified: boolean,
  ): Promise<string> {
    this.logger.log(`Creating access token for user with ID: ${userId}`);

    const token = this.jwtService.signAsync(
      { sub: userId, email, role, isEmailVerified },
      {
        secret: this.jwtAccessSecret,
        expiresIn: this.jwtAccessTokenExpirationTime,
      },
    );

    this.logger.log(`Access token created for user with ID: ${userId}`);
    return token;
  }

  private async createRefreshToken(
    userId: number,
    email: string,
    role: Role,
    isEmailVerified: boolean,
  ): Promise<string> {
    this.logger.log(`Creating refresh token for user with ID: ${userId}`);

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email, role, isEmailVerified },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshTokenExpirationTime,
      },
    );

    await this.storeRefreshToken(userId, refreshToken);

    this.logger.log(`Refresh token created and stored for user with ID: ${userId}`);
    return refreshToken;
  }

  private async verifyRefreshToken(providedToken: string, storedToken: string): Promise<boolean> {
    this.logger.log(`Verifying refresh token`);

    const isValid = await bcrypt.compare(providedToken, storedToken);

    this.logger.log(`Refresh token verification result: ${isValid}`);
    return isValid;
  }
}
