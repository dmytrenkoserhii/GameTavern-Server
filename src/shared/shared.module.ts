import { Module } from '@nestjs/common';

import { CookiesService, EmailService } from './services';

@Module({
  providers: [CookiesService, EmailService],
  exports: [CookiesService, EmailService],
})
export class SharedModule {}
