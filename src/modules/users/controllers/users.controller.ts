import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentSession } from '@/modules/auth/decorators/current-session.decorator';
import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { JwtAccessPayload } from '@/modules/auth/types/jwt-access-payload.interface';

import { ConfirmEmailDto } from '../dtos';
import { User } from '../entities';
import { UsersService, VerificationService } from '../services';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationService: VerificationService,
  ) {}

  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all users', type: [User] })
  @Get()
  public async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return current user', type: User })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get('current')
  public async findCurrentUser(@CurrentSession() session: JwtAccessPayload): Promise<User> {
    const user = await this.usersService.findOneById(session.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @ApiOperation({ summary: 'Confirm email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email confirmed successfully' })
  @Post('confirm-email')
  public async confirm(@Body() confirmEmailDto: ConfirmEmailDto): Promise<void> {
    await this.verificationService.confirmEmail(confirmEmailDto);
  }

  @ApiOperation({ summary: 'Resend confirmation link' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Confirmation link resent successfully' })
  @ApiBearerAuth()
  @Post('reconfirm-email')
  @UseGuards(AccessTokenGuard)
  public async resendConfirmationLink(@CurrentSession() session: JwtAccessPayload): Promise<void> {
    await this.verificationService.resendConfirmationLink(session.sub);
  }
}
