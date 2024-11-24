import { validateOrReject } from 'class-validator';

import * as bcrypt from 'bcrypt';
import { DeleteResult, MoreThanOrEqual, Repository } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { ForgotPasswordDto } from '@/modules/auth/dtos/forgot-passowrd.dto';
import { SignUpDto } from '@/modules/auth/dtos/sign-up.dto';
import { ENV } from '@/shared/enums/env.enum';
import { EmailService } from '@/shared/services/email.service';

import { ResetPasswordDto } from '../../auth/dtos/reset-password.dto';
import { CreateUserWithoutPasswordDto } from '../dtos/create-user-without-password.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { TimePeriods } from './../../../shared/enums/time-periods.enum';
import { generateRandomToken } from './../../../utils/generate-random-token';
import { AccountService } from './account.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly clientUrl: string;
  private readonly emailSendFrom: string;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {
    this.clientUrl = this.configService.get<string>(ENV.CLIENT_URL, '');
    this.emailSendFrom = this.configService.get<string>(ENV.EMAIL_SEND_FROM, '');
  }

  public async create(signUpDto: SignUpDto): Promise<User> {
    this.logger.log(`Creating user with email: ${signUpDto.email}`);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    const { username, ...userData } = signUpDto;

    const user = this.usersRepository.create({
      ...userData,
      hashedPassword,
    });

    await this.usersRepository.save(user);
    await this.accountService.create({ username }, user);
    this.logger.log(`User with email: ${signUpDto.email} created successfully`);

    return user;
  }

  public async createWithoutPassword(createUserDto: CreateUserWithoutPasswordDto): Promise<User> {
    this.logger.log(`Creating user without password with email: ${createUserDto.email}`);

    try {
      await validateOrReject(createUserDto);
    } catch (errors) {
      this.logger.error(`Validation failed for user without password: ${errors}`);
      throw new BadRequestException(errors);
    }

    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);

    this.logger.log(
      `User without password with email: ${createUserDto.email} created successfully`,
    );
    return user;
  }

  public findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return this.usersRepository.find();
  }

  public async findOneById(id: number, fieldsToInclude: string[] = []): Promise<User | null> {
    this.logger.log(`Finding user by ID: ${id}`);
    let query = this.usersRepository.createQueryBuilder('user').where('user.id = :id', { id });

    fieldsToInclude.forEach((field) => {
      query = query.addSelect(`user.${field}`);
    });

    return query.getOne();
  }

  public async findOneByEmail(email: string, fieldsToInclude: string[] = []): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    let query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    fieldsToInclude.forEach((field) => {
      query = query.addSelect(`user.${field}`);
    });

    const user = await query.getOne();
    return user;
  }

  public async findOneByOAuthId(oauthId: string): Promise<User | null> {
    this.logger.log(`Finding user by OAuth ID: ${oauthId}`);
    return this.usersRepository.findOneBy({ oauthId });
  }

  public async update(id: number, updateData: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID: ${id}`);

    const user = await this.findOneById(id);
    if (!user) {
      this.logger.error(`User not found with ID: ${id}`);
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    await this.usersRepository.save(user);

    this.logger.log(`User with ID: ${id} updated successfully`);
    return user;
  }

  public async deleteById(id: number): Promise<DeleteResult> {
    this.logger.log(`Deleting user with ID: ${id}`);
    return this.usersRepository.delete(id);
  }

  public async validateUser(email: string, password: string): Promise<User> {
    this.logger.log(`Validating user with email: ${email}`);

    const user = await this.findOneByEmail(email, ['hashedPassword']);

    if (!user) {
      this.logger.error(`Invalid credentials for email: ${email}`);
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.hashedPassword) {
      this.logger.error(`Authentication failed for email: ${email}`);
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      this.logger.error(`Invalid credentials for email: ${email}`);
      throw new BadRequestException('Invalid credentials');
    }

    this.logger.log(`User with email: ${email} validated successfully`);
    return user;
  }

  public async sendPasswordResetEmail(forgotPasswordDto: ForgotPasswordDto) {
    this.logger.log(`Sending reset email to: ${forgotPasswordDto.email}`);

    const user = await this.findOneByEmail(forgotPasswordDto.email, ['oauthId']);

    if (!user) {
      this.logger.error(`User not found with email: ${forgotPasswordDto.email}`);
      throw new NotFoundException('User not found');
    }

    // Check if the user signed up using Google OAuth
    if (user.oauthId) {
      // Handle the case where the user signed up using Google OAuth
      // For example, send an email informing them to use Google to sign in
      await this.emailService.send({
        to: forgotPasswordDto.email,
        from: this.emailSendFrom,
        subject: 'Sign in using Google',
        html: `<p>It looks like you signed up using Google. Please continue to sign in using Google. If you're having trouble accessing your account, please contact our support team.</p>`,
      });

      this.logger.log(
        `Informed user signed up with Google to use Google sign in: ${forgotPasswordDto.email}`,
      );
      return;
    }

    // Proceed with the usual password reset process for users with a password
    const resetPasswordToken = generateRandomToken();
    const resetPasswordTokenExpiresAt = new Date(Date.now() + TimePeriods.HOUR);

    await this.update(user.id, { resetPasswordToken, resetPasswordTokenExpiresAt });

    const resetUrl = `${this.clientUrl}/reset-password/${resetPasswordToken}`;

    await this.emailService.send({
      to: forgotPasswordDto.email,
      from: this.emailSendFrom,
      subject: 'Password Reset',
      html: `<p>Please use the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    this.logger.log(`Reset email sent to: ${forgotPasswordDto.email}`);
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    this.logger.log(`Resetting password with token: ${resetPasswordDto.token}`);

    const user = await this.usersRepository.findOneBy({
      resetPasswordToken: resetPasswordDto.token,
      resetPasswordTokenExpiresAt: MoreThanOrEqual(new Date()),
    });

    if (!user) {
      this.logger.error(`Invalid or expired token: ${resetPasswordDto.token}`);
      throw new BadRequestException('Invalid or expired token');
    }

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, salt);

      user.hashedPassword = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiresAt = null;
      await this.usersRepository.save(user);

      this.logger.log(`Password reset successfully for token: ${resetPasswordDto.token}`);
    } catch (error) {
      this.logger.error(`Error resetting password for token: ${resetPasswordDto.token}`, error);
      throw new InternalServerErrorException('Error resetting password');
    }
  }
}
