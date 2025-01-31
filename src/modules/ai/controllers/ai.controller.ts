import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { ALL_API_GAMES_RESPONSE_EXAMPLE_DATA } from '@/modules/games-api/constants/all-api-games-response-example-data.constant';
import { ApiListGame } from '@/modules/games-api/types/api-list-game.interface';

import { GameDescriptionDto } from '../dtos/game-description.dto';
import { GameRecommendationsDto } from '../dtos/game-recommendations.dto';
import { AiService } from '../services/ai.service';

@ApiTags('AI')
@Controller('ai')
@UseGuards(AccessTokenGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('games-recommendations-by-description')
  @ApiOperation({ summary: 'Get game recommendations based on description' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Return array of games matching the description',
    content: {
      'application/json': {
        example: [ALL_API_GAMES_RESPONSE_EXAMPLE_DATA],
      },
    },
  })
  async getGamesRecommendationsByDescription(
    @Body() dto: GameDescriptionDto,
  ): Promise<ApiListGame[]> {
    return this.aiService.getGamesByDescription(dto);
  }

  @Post('list-games-recommendations')
  @ApiOperation({ summary: 'Get recommendations for games' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Return array of games similar to the games in the list',
    content: {
      'application/json': {
        example: [ALL_API_GAMES_RESPONSE_EXAMPLE_DATA],
      },
    },
  })
  async getListGamesRecommendations(@Body() dto: GameRecommendationsDto): Promise<ApiListGame[]> {
    return this.aiService.getListGamesRecommendations(dto);
  }
}
