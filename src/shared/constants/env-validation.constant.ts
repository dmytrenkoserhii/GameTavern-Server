import * as Joi from 'joi';

import { ENV } from '@/shared/enums';

export const ENV_VALIDATION = {
  [ENV.PORT]: Joi.number(),

  [ENV.IS_PRODUCTION]: Joi.boolean().required(),

  [ENV.CLIENT_URL]: Joi.string().required(),

  [ENV.CORS_ORIGIN]: Joi.string().required(),
  [ENV.CORS_HEADERS]: Joi.string().required(),
  [ENV.CORS_CREDENTIALS]: Joi.boolean().required(),

  [ENV.DATABASE_URL]: Joi.string().required(),

  [ENV.JWT_ACCESS_SECRET]: Joi.string().required(),
  [ENV.JWT_REFRESH_SECRET]: Joi.string().required(),
  [ENV.JWT_VERIFICATION_TOKEN_SECRET]: Joi.string().required(),
  [ENV.JWT_ACCESS_TOKEN_EXPIRATION_TIME]: Joi.string().required(),
  [ENV.JWT_REFRESH_TOKEN_EXPIRATION_TIME]: Joi.string().required(),
  [ENV.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME]: Joi.string().required(),

  [ENV.GOOGLE_CLIENT_ID]: Joi.string().required(),
  [ENV.GOOGLE_CLIENT_SECRET]: Joi.string().required(),
  [ENV.GOOGLE_CALLBACK_URL]: Joi.string().required(),

  [ENV.MAILGUN_DOMAIN]: Joi.string().required(),
  [ENV.MAILGUN_KEY]: Joi.string().required(),
  [ENV.EMAIL_SEND_FROM]: Joi.string().required(),

  [ENV.GIANT_BOMB_API_URL]: Joi.string().required(),
  [ENV.GIANT_BOMB_API_KEY]: Joi.string().required(),

  [ENV.LEMONSQUEEZY_API_URL]: Joi.string().required(),
  [ENV.LEMONSQUEEZY_API_KEY]: Joi.string().required(),
  [ENV.LEMONSQUEEZY_STORE_ID]: Joi.string().required(),
  [ENV.LEMONSQUEEZY_WEBHOOK_SIGNATURE]: Joi.string().required(),

  [ENV.OPENAI_API_KEY]: Joi.string().required(),
};
