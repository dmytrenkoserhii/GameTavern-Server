import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListsModule } from '../lists/lists.module';
import { GamesController } from './controllers/games.controller';
import { Game } from './entities/game.entity';
import { GamesService } from './services/games.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), ListsModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
