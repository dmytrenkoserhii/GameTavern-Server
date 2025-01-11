import { Repository } from 'typeorm';

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ListsService } from '@/modules/lists/services/lists.service';

import { AddGameDto } from '../dtos/add-game.dto';
import { MoveGameDto } from '../dtos/move-game.dto';
import { Game } from '../entities/game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly listsService: ListsService,
  ) {}

  async addGame(addGameDto: AddGameDto): Promise<Game> {
    const existingGame = await this.gamesRepository.findOne({
      where: {
        gameApiId: addGameDto.gameApiId,
        listId: addGameDto.listId,
      },
    });

    if (existingGame) {
      throw new ConflictException('This game already exists in the list');
    }

    const maxOrderGame = await this.gamesRepository
      .createQueryBuilder('game')
      .where('game.listId = :listId', { listId: addGameDto.listId })
      .orderBy('game.orderNumber', 'DESC')
      .getOne();

    const newGame = this.gamesRepository.create({
      ...addGameDto,
      orderNumber: maxOrderGame ? maxOrderGame.orderNumber + 1 : 1,
    });

    return this.gamesRepository.save(newGame);
  }

  async moveGame(id: number, moveGameDto: MoveGameDto, userId: number): Promise<Game> {
    const game = await this.gamesRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    await this.listsService.validateListOwnership(game.list.id, userId);
    await this.listsService.validateListOwnership(moveGameDto.targetListId, userId);

    await this.gamesRepository
      .createQueryBuilder()
      .update(Game)
      .set({ listId: moveGameDto.targetListId })
      .where('id = :id', { id })
      .execute();

    const updatedGame = await this.gamesRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!updatedGame) {
      throw new NotFoundException('Game not found after update');
    }

    return updatedGame;
  }

  async removeGame(gameId: number, userId: number): Promise<void> {
    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: ['list'],
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    await this.listsService.validateListOwnership(game.list.id, userId);

    await this.gamesRepository.remove(game);
  }

  async getGamesByListId(listId: number): Promise<Game[]> {
    return this.gamesRepository.find({
      where: { listId },
      order: { orderNumber: 'ASC' },
    });
  }

  async updateGameOrder(updates: { id: number; orderNumber: number }[]): Promise<void> {
    await this.gamesRepository.manager.transaction(async (transactionalEntityManager) => {
      const updatePromises = updates.map(({ id, orderNumber }) =>
        transactionalEntityManager
          .createQueryBuilder()
          .update(Game)
          .set({ orderNumber })
          .where('id = :id', { id })
          .execute(),
      );

      await Promise.all(updatePromises);
    });
  }
}
