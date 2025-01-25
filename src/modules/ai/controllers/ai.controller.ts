import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GameRecommendationsDto } from '../dtos/game-recommendations.dto';
import { AiService } from '../services/ai.service';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('list-games-recommendations')
  @ApiOperation({ summary: 'Get recommendations for games' })
  async getGamesRecommendations(@Body() dto: GameRecommendationsDto) {
    return this.aiService.getGamesRecommendations(dto);
  }
}
