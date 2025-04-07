import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../games/entities';
import { ListsController } from './controllers';
import { List } from './entities';
import { ListsService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([List, Game])],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}
