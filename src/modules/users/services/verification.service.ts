import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ENV } from '@/shared/enums/env.enum';
import { EmailService } from '@/shared/services/email.service';

import { ConfirmEmailDto } from '../dtos';
import { VerificationTokenPayload } from '../types';
import { UsersService } from './users.service';

@Injectable()
export class VerificationService {
  private readonly jwtVerificationTokenSecret: string;
  private readonly jwtVerificationTokenExpirationTime: string;
  private readonly clientUrl: string;
  private readonly emailSendFrom: string;
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {
    this.jwtVerificationTokenSecret = this.configService.get<string>(
      ENV.JWT_VERIFICATION_TOKEN_SECRET,
      '',
    );
    this.jwtVerificationTokenExpirationTime = this.configService.get<string>(
      ENV.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME,
      '',
    );
    this.clientUrl = this.configService.get<string>(ENV.CLIENT_URL, '');
    this.emailSendFrom = this.configService.get<string>(ENV.EMAIL_SEND_FROM, '');
  }

  public async sendVerificationLink(email: string): Promise<void> {
    // TODO: store the most recent confirmation token in the database and check it before confirming
    this.logger.log(`Sending verification link to ${email}`);
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.jwtVerificationTokenSecret,
      expiresIn: this.jwtVerificationTokenExpirationTime,
    });

    const url = `${this.clientUrl}/confirm-email?token=${token}`;

    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

    await this.emailService.send({
      to: email,
      from: this.emailSendFrom,
      subject: 'Email confirmation',
      text,
    });
    this.logger.log(`Verification link sent to ${email}`);
  }

  public async resendConfirmationLink(userId: number): Promise<void> {
    this.logger.log(`Resending confirmation link to user ID: ${userId}`);
    const user = await this.usersService.findOneById(userId);

    if (!user) {
      this.logger.error(`User not found with ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      this.logger.warn(`Email already confirmed for user ID: ${userId}`);
      throw new BadRequestException('Email already confirmed');
    }

    await this.sendVerificationLink(user.email);
    this.logger.log(`Confirmation link resent to user ID: ${userId}`);
  }

  public async confirmEmail(confirmEmailDto: ConfirmEmailDto): Promise<void> {
    const email = await this.decodeConfirmationToken(confirmEmailDto.token);

    this.logger.log(`Confirming email for ${email}`);

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      this.logger.error(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      this.logger.warn(`Email already confirmed for ${email}`);
      throw new BadRequestException('Email already confirmed');
    }

    await this.usersService.update(user.id, { isEmailVerified: true });
    this.logger.log(`Email confirmed for ${email}`);
  }

  private async decodeConfirmationToken(token: string): Promise<string> {
    this.logger.log(`Decoding confirmation token`);
    try {
      const payload = await this.jwtService.verify<VerificationTokenPayload>(token, {
        secret: this.jwtVerificationTokenSecret,
      });

      if (payload?.email) {
        this.logger.log(`Token decoded successfully for email: ${payload.email}`);
        return payload.email;
      }

      this.logger.error(`Bad confirmation token`);
      throw new BadRequestException('Bad confirmation token');
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        this.logger.error(`Email confirmation token expired`);
        throw new BadRequestException('Email confirmation token expired');
      }

      this.logger.error(`Bad confirmation token`);
      throw new BadRequestException('Bad confirmation token');
    }
  }
}
