import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { CookiesKeys } from '@/shared/enums/cookies-keys.enum';

import { JwtAccessPayload } from '../types/jwt-access-payload.interface';
import { JwtRefreshPayload } from '../types/jwt-refresh-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.[CookiesKeys.REFRESH_TOKEN];
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  validate(req: Request, payload: JwtAccessPayload): JwtRefreshPayload {
    const refreshToken = req?.cookies?.[CookiesKeys.REFRESH_TOKEN];
    return { ...payload, refreshToken };
  }
}
