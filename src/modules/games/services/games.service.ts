import { Repository } from 'typeorm';

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { List } from '@/modules/lists/entities/list.entity';
import { ListsService } from '@/modules/lists/services/lists.service';

import { CreateDto } from '../dtos/create-game.dto';
import { MoveDto } from '../dtos/move.dto';
import { Game } from '../entities/game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly listsService: ListsService,
  ) {}

  async getAll(listId: number, userId: number): Promise<Game[]> {
    return this.gamesRepository.find({
      where: {
        list: {
          id: listId,
          user: { id: userId },
        },
      },
      relations: ['list', 'list.user'],
      order: { orderNumber: 'ASC' },
    });
  }

  async create(createDto: CreateDto): Promise<Game> {
    const existingGame = await this.gamesRepository.findOne({
      where: {
        gameApiId: createDto.gameApiId,
        list: { id: createDto.listId },
      },
    });

    if (existingGame) {
      throw new ConflictException('This game already exists in the list');
    }

    const maxOrderGame = await this.gamesRepository
      .createQueryBuilder('game')
      .select('MAX(game.orderNumber)', 'maxOrder')
      .where('game.list = :listId', { listId: createDto.listId })
      .getRawOne();

    const newGame = this.gamesRepository.create({
      ...createDto,
      list: { id: createDto.listId },
      orderNumber: maxOrderGame ? maxOrderGame.maxOrder + 1 : 1,
    });

    return this.gamesRepository.save(newGame);
  }

  async move(id: number, moveDto: MoveDto, userId: number): Promise<Game> {
    const game = await this.gamesRepository.findOne({
      where: {
        id,
        list: {
          user: { id: userId },
        },
      },
      relations: ['list', 'list.user'],
    });

    if (!game) {
      throw new NotFoundException('Game not found or access denied');
    }

    game.list = { id: moveDto.targetListId } as List;
    return this.gamesRepository.save(game);
  }

  async delete(id: number, userId: number): Promise<void> {
    const game = await this.gamesRepository.findOne({
      where: {
        id,
        list: {
          user: { id: userId },
        },
      },
      relations: ['list', 'list.user'],
    });

    if (!game) {
      throw new NotFoundException('Game not found or access denied');
    }

    await this.gamesRepository.remove(game);
  }

  async updateOrder(updates: { id: number; orderNumber: number }[]): Promise<void> {
    const cases = updates.map((item) => `WHEN id = ${item.id} THEN ${item.orderNumber}`).join(' ');

    const ids = updates.map((item) => item.id).join(',');

    const query = `
      UPDATE games 
      SET "orderNumber" = CASE 
        ${cases}
        ELSE "orderNumber" 
      END 
      WHERE id IN (${ids})
    `;

    await this.gamesRepository.query(query);
  }
}
