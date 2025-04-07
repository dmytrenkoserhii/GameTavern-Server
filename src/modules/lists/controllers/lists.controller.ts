import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentSession } from '@/modules/auth/decorators/current-session.decorator';
import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { JwtAccessPayload } from '@/modules/auth/types/jwt-access-payload.interface';
import { PaginatedResponse } from '@/shared/types/paginated-response.interface';

import {
  SINGLE_ALL_LISTS_RESPONSE_EXAMPLE_DATA,
  SINGLE_LIST_RESPONSE_EXAMPLE_DATA,
} from '../constants';
import { CreateListDto, UpdateListDto } from '../dtos';
import { List } from '../entities';
import { ListsService } from '../services';

@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@ApiTags('Lists')
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @ApiOperation({ summary: 'Find all lists' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all lists',
    content: {
      'application/json': {
        example: SINGLE_ALL_LISTS_RESPONSE_EXAMPLE_DATA,
      },
    },
  })
  @Get('')
  public async findAll(
    @CurrentSession() session: JwtAccessPayload,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('sort') sort?: string,
  ): Promise<PaginatedResponse<List>> {
    return this.listsService.findAllPaginatedByUser(session.sub, page, limit, sort);
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
  async findOneById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<List> {
    return this.listsService.findOneById(id, session.sub);
  }

  @ApiOperation({ summary: 'Create a new list' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'List created successfully', type: List })
  @Post()
  public async create(
    @Body() createListDto: CreateListDto,
    @CurrentSession('sub') userId: number,
  ): Promise<List> {
    return this.listsService.create(createListDto, userId);
  }

  @ApiOperation({ summary: 'Update a list by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the list to update' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List updated successfully', type: List })
  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListDto: UpdateListDto,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<List> {
    return this.listsService.update(id, updateListDto, session.sub);
  }

  @ApiOperation({ summary: 'Delete a list by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the list to delete' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'List deleted successfully' })
  @Delete(':id')
  public async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentSession() session: JwtAccessPayload,
  ): Promise<void> {
    return this.listsService.delete(id, session.sub);
  }
}
