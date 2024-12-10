import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SINGLE_LIST_RESPONSE_EXAMPLE_DATA } from '../constants/single-list-response-example-data.constant';
import { CreateListDto } from '../dtos/create-list.dto';
import { UpdateListDto } from '../dtos/update-list.dto';
import { List } from '../entities/list.entity';
import { ListsService } from '../services/lists.service';

@ApiTags('Lists')
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @ApiOperation({ summary: 'Find all lists' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all lists',
    type: [List],
  })
  @Get()
  public async findAll(): Promise<List[]> {
    return this.listsService.findAll();
  }

  @ApiOperation({ summary: 'Get a list by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the list to fetch' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a single list',
    content: {
      'application/json': {
        example: SINGLE_LIST_RESPONSE_EXAMPLE_DATA,
      },
    },
  })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<List> {
    return this.listsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new list' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'List created successfully', type: List })
  @Post()
  public async create(@Body() createListDto: CreateListDto): Promise<List> {
    return this.listsService.create(createListDto);
  }

  @ApiOperation({ summary: 'Update a list by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the list to update' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List updated successfully', type: List })
  @Patch(':id')
  public async update(
    @Param('id') id: number,
    @Body() updateListDto: UpdateListDto,
  ): Promise<List> {
    return this.listsService.update(id, updateListDto);
  }

  @ApiOperation({ summary: 'Delete a list by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the list to delete' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'List deleted successfully' })
  @Delete(':id')
  public async delete(@Param('id') id: number): Promise<void> {
    return this.listsService.delete(id);
  }
}
