import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ALL_API_GAMES_RESPONSE_EXAMPLE_DATA } from '../constants/all-api-games-response-example-data.constant';
import { ALL_API_PLATFORMS_RESPONSE_EXAMPLE_DATA } from '../constants/all-api-platforms-response-example-data.constant';
import { SINGLE_API_GAME_RESPONSE_EXAMPLE_DATA } from '../constants/single-api-game-response-example-data.constant';
import { GamesApiService } from '../services/games-api.service';
import { ApiListGame } from '../types/api-list-game.interface';
import { ApiSingleGame } from '../types/api-single-game.inteface';

import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { AccessTokenGuard } from 'src/modules/auth/guards/access-token.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/modules/users/enums/role.enum';

@ApiBearerAuth()
@Roles(Role.USER, Role.ADMIN)
@UseGuards(AccessTokenGuard, RolesGuard)
@ApiTags('Games API')
@Controller('games-api')
export class GamesApiController {
  constructor(private readonly gamesApiService: GamesApiService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search games by name with pagination, sorting, and filtering' })
  @ApiQuery({ name: 'name', required: false, description: 'Name of the game to search for' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description:
      'Sort field and direction (e.g., name:asc, original_release_date:desc, platform:asc, genre:desc)',
    example: 'name:asc',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Filter by release year',
    type: Number,
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    description: 'Filter by platform ID',
    type: Number,
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    description: 'Filter by genre ID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an array of games with pagination info',
    content: {
      'application/json': {
        example: {
          games: ALL_API_GAMES_RESPONSE_EXAMPLE_DATA,
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  async searchGames(
    @Query('name') name: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: string,
    @Query('year') year?: string,
    @Query('platform') platform?: string,
    @Query('genre') genre?: string,
  ): Promise<{
    games: ApiListGame[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const parsedYear = year ? parseInt(year) : undefined;
    const parsedPlatform = platform ? parseInt(platform) : undefined;
    const parsedGenre = genre ? parseInt(genre) : undefined;

    const { games, total } = await this.gamesApiService.getGamesByName(
      name,
      page,
      limit,
      sort,
      parsedYear,
      parsedPlatform,
      parsedGenre,
    );
    const totalPages = Math.ceil(total / limit);

    return {
      games,
      total,
      page,
      limit,
      totalPages,
    };
  }

  @Get('platforms')
  @ApiOperation({ summary: 'Get all gaming platforms' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an array of all gaming platforms',
    content: {
      'application/json': {
        example: ALL_API_PLATFORMS_RESPONSE_EXAMPLE_DATA,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async getAllPlatforms() {
    return this.gamesApiService.getAllPlatforms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a game by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the game to fetch' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a single game',
    content: {
      'application/json': {
        example: SINGLE_API_GAME_RESPONSE_EXAMPLE_DATA,
      },
    },
  })
  async getGame(@Param('id') id: string): Promise<ApiSingleGame> {
    return this.gamesApiService.getGameById(id);
  }
}
