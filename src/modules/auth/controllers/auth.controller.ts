import { Response } from 'express';

import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ResetPasswordDto } from '@/modules/auth/dtos/reset-password.dto';
import { UsersService } from '@/modules/users/services/users.service';
import { CookiesKeys } from '@/shared/enums/cookies-keys.enum';
import { ENV } from '@/shared/enums/env.enum';
import { TimePeriods } from '@/shared/enums/time-periods.enum';
import { CookiesService } from '@/shared/services/cookies.service';

import { CurrentSession } from '../decorators/current-session.decorator';
import { ForgotPasswordDto } from '../dtos/forgot-passowrd.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { GoogleAuthPayload } from '../types/google-auth-payload.interface';
import { JwtAccessPayload } from '../types/jwt-access-payload.interface';
import { JwtRefreshPayload } from '../types/jwt-refresh-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: CookiesService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully signed up' })
  @ApiBody({ type: SignUpDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  public async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const response = await this.authService.signUp(signUpDto);

    this.setAuthCookies(res, response.tokens);

    return { user: response.user };
  }

  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully signed in',
    type: SignInDto, // TODO: update
  })
  @ApiBody({ type: SignInDto })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  public async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const response = await this.authService.signIn(signInDto);

    this.setAuthCookies(res, response.tokens);

    return { user: response.user };
  }

  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tokens successfully refreshed' })
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  public async refreshTokens(
    @CurrentSession() session: JwtRefreshPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.tokenService.refreshTokens(session.sub, session.refreshToken);

    this.setAuthCookies(res, response.tokens);

    return { user: response.user };
  }

  @ApiOperation({ summary: 'Logout the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged out' })
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('logout')
  public async logout(
    @CurrentSession() session: JwtAccessPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(session.sub);

    this.cookiesService.removeCookie(res, CookiesKeys.ACCESS_TOKEN);
    this.cookiesService.removeCookie(res, CookiesKeys.REFRESH_TOKEN);
  }

  // Google OAuth2
  @ApiOperation({ summary: 'Authenticate with Google' })
  @ApiResponse({ status: HttpStatus.FOUND, description: 'Redirect to Google authentication' })
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  public async googleAuth() {}

  @ApiOperation({ summary: 'Google authentication callback' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully authenticated with Google',
  })
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(
    @CurrentSession() session: GoogleAuthPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const clientUrl = this.configService.get<string>(`${ENV.CLIENT_URL}`);

    this.setAuthCookies(res, session);
    res.redirect(`${clientUrl}/auth/sign-in`);
  }

  // Password reset
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset link sent if user exists' })
  @Post('forgot-password')
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.usersService.sendPasswordResetEmail(forgotPasswordDto);
  }

  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password successfully reset' })
  @Post('reset-password')
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(resetPasswordDto);
  }

  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    this.cookiesService.setCookie(
      res,
      CookiesKeys.ACCESS_TOKEN,
      tokens.accessToken,
      TimePeriods.HOUR,
    );
    this.cookiesService.setCookie(
      res,
      CookiesKeys.REFRESH_TOKEN,
      tokens.refreshToken,
      TimePeriods.WEEK,
    );
  }
}
