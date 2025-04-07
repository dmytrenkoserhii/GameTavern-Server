import { Module } from '@nestjs/common';

import { GamesApiController } from './controllers';
import { GamesApiService } from './services';

@Module({
  controllers: [GamesApiController],
  providers: [GamesApiService],
  exports: [GamesApiService],
})
export class GamesApiModule {}
