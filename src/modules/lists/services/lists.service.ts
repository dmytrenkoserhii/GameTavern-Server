import { Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateListDto } from '../dtos/create-list.dto';
import { UpdateListDto } from '../dtos/update-list.dto';
import { List } from '../entities/list.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  public async findAll(): Promise<List[]> {
    return this.listRepository.find();
  }

  public async findOne(id: number): Promise<List> {
    const list = await this.listRepository.findOne({ where: { id } });
    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }
    return list;
  }

  public async create(createListDto: CreateListDto): Promise<List> {
    const list = this.listRepository.create(createListDto);
    return this.listRepository.save(list);
  }

  public async update(id: number, updateListDto: UpdateListDto): Promise<List> {
    const list = await this.findOne(id);
    Object.assign(list, updateListDto);
    return this.listRepository.save(list);
  }

  public async delete(id: number): Promise<void> {
    const list = await this.findOne(id);
    await this.listRepository.remove(list);
  }
}
