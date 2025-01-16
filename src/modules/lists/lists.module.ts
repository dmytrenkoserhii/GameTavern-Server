import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../games/entities/game.entity';
import { ListsController } from './controllers/lists.controller';
import { List } from './entities/list.entity';
import { ListsService } from './services/lists.service';

@Module({
  imports: [TypeOrmModule.forFeature([List, Game])],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}
