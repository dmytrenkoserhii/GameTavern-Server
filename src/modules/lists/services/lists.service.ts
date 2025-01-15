import { createPaginatedResponse } from '@shared/utils/create-paginated-response';

import { Repository } from 'typeorm';

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResponse } from '@/shared/types/paginated-response.interface';

import { CreateListDto } from '../dtos/create-list.dto';
import { UpdateListDto } from '../dtos/update-list.dto';
import { List } from '../entities/list.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  public async findAllPaginatedByUser(
    userId: number,
    page: number,
    limit: number,
    sort?: string,
  ): Promise<PaginatedResponse<List>> {
    const queryBuilder = this.listRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.user', 'user')
      .where('user.id = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit);

    if (sort) {
      const [field, direction] = sort.split(':');
      queryBuilder.orderBy(`list.${field}`, direction.toUpperCase() as 'ASC' | 'DESC');
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(items, total, page, limit);
  }

  public async findOneById(id: number): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id },
      relations: ['games'],
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }

    return list;
  }

  public async create(createListDto: CreateListDto, userId: number): Promise<List> {
    const list = this.listRepository.create({ ...createListDto, user: { id: userId } });
    return this.listRepository.save(list);
  }

  public async update(id: number, updateListDto: UpdateListDto): Promise<List> {
    const list = await this.findOneById(id);
    Object.assign(list, updateListDto);
    return this.listRepository.save(list);
  }

  public async delete(id: number): Promise<void> {
    const list = await this.findOneById(id);
    await this.listRepository.remove(list);
  }

  async validateListOwnership(listId: number, userId: number): Promise<void> {
    const list = await this.listRepository.findOne({
      where: { id: listId, user: { id: userId } },
    });

    if (!list) {
      throw new ForbiddenException('You do not own this list');
    }
  }
}
