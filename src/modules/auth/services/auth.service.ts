import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { VerificationService } from '@/modules/users/services/verification.service';

import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { Tokens } from '../types/tokens.interface';
import { User } from './../../users/entities/user.entity';
import { UsersService } from './../../users/services/users.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly verificationService: VerificationService,
  ) {}

  public async signUp(signUpDto: SignUpDto): Promise<{ user: User; tokens: Tokens }> {
    this.logger.log(`Attempting to sign up user with email: ${signUpDto.email}`);

    const userExists = await this.usersService.findOneByEmail(signUpDto.email);
    if (userExists) {
      this.logger.error(
        `Sign up attempt failed: User with email ${signUpDto.email} already exists`,
      );
      throw new BadRequestException('User already exists');
    }

    const newUser = await this.usersService.create(signUpDto);

    await this.verificationService.sendVerificationLink(signUpDto.email);

    this.logger.log(`User with email ${signUpDto.email} successfully signed up`);
    const tokens = await this.generateAndStoreTokens(newUser);
    return { user: newUser, tokens };
  }

  public async signIn(signInDto: SignInDto): Promise<{ user: User; tokens: Tokens }> {
    this.logger.log(`Attempting to sign in user with email: ${signInDto.email}`);

    const user = await this.usersService.validateUser(signInDto.email, signInDto.password);

    this.logger.log(`User with email ${signInDto.email} successfully signed in`);
    const tokens = await this.generateAndStoreTokens(user);
    return { user, tokens };
  }

  public async logout(id: number): Promise<void> {
    this.logger.log(`Logging out user with id: ${id}`);

    return this.tokenService.removeRefreshToken(id);
  }

  private async generateAndStoreTokens(user: User): Promise<Tokens> {
    this.logger.log(`Generating and storing tokens for user with id: ${user.id}`);

    const tokens = await this.tokenService.createTokens(user);
    await this.tokenService.storeRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`Tokens for user with id: ${user.id} successfully generated and stored`);
    return tokens;
  }
}
