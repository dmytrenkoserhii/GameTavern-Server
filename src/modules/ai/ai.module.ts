import { Module } from '@nestjs/common';

import { GamesApiModule } from '../games-api/games-api.module';
import { GamesModule } from '../games/games.module';
import { AiController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';

@Module({
  imports: [GamesApiModule, GamesModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
