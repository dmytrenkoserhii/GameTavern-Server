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

import { CreateDto, MoveDto, UpdateOrderDto } from '../dtos';
import { Game } from '../entities';
import { GamesService } from '../services';

@ApiTags('Games')
@Controller('games')
@UseGuards(AccessTokenGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('list/:listId')
  async getAll(
    @Param('listId', ParseIntPipe) listId: number,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<Game[]> {
    return this.gamesService.getAll(listId, session.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add a game to a list' })
  async create(
    @Body() createDto: CreateDto,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<Game> {
    return this.gamesService.create(createDto, session.sub);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a game to another list' })
  async move(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveDto: MoveDto,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<Game> {
    return this.gamesService.move(id, moveDto, session.sub);
  }

  @Patch('order')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update the order of games in a list' })
  async updateOrder(@Body() updateOrderDto: UpdateOrderDto): Promise<void> {
    return this.gamesService.updateOrder(updateOrderDto.updates);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a game from a list' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<void> {
    return this.gamesService.delete(id, session.sub);
  }
}
