import { Module } from '@nestjs/common';

import { GamesApiController } from './controllers/games-api.controller';
import { GamesApiService } from './services/games-api.service';

@Module({
  controllers: [GamesApiController],
  providers: [GamesApiService],
  exports: [GamesApiService],
})
export class GamesApiModule {}
