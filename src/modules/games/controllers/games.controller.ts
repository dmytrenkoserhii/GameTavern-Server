import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentSession } from '@/modules/auth/decorators/current-session.decorator';
import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { JwtAccessPayload } from '@/modules/auth/types/jwt-access-payload.interface';

import { AddGameDto } from '../dtos/add-game.dto';
import { MoveGameDto } from '../dtos/move-game.dto';
import { UpdateGameOrderDto } from '../dtos/update-game-order.dto';
import { Game } from '../entities/game.entity';
import { GamesService } from '../services/games.service';

@ApiTags('Games')
@Controller('games')
@UseGuards(AccessTokenGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a game to a list' })
  async addGame(@Body() addGameDto: AddGameDto): Promise<Game> {
    return this.gamesService.addGame(addGameDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a game from a list' })
  async removeGame(
    @Param('id', ParseIntPipe) id: number,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<void> {
    return this.gamesService.removeGame(id, session.sub);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a game to another list' })
  async moveGame(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveGameDto: MoveGameDto,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<Game> {
    return this.gamesService.moveGame(id, moveGameDto, session.sub);
  }

  @Get('list/:listId')
  @ApiOperation({ summary: 'Get all games in a list' })
  async getGamesByList(@Param('listId', ParseIntPipe) listId: number): Promise<Game[]> {
    return this.gamesService.getGamesByListId(listId);
  }

  @Patch('order')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update the order of games in a list' })
  async updateGameOrder(@Body() updateGameOrderDto: UpdateGameOrderDto): Promise<void> {
    return this.gamesService.updateGameOrder(updateGameOrderDto.updates);
  }
}
