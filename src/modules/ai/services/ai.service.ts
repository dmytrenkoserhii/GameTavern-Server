import OpenAI from 'openai';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GamesApiService } from '@/modules/games-api/services/games-api.service';
import { Game } from '@/modules/games/entities/game.entity';
import { GamesService } from '@/modules/games/services/games.service';
import { ENV } from '@/shared/enums';

import { GameRecommendationsDto } from '../dtos/game-recommendations.dto';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly gamesApiService: GamesApiService,
    private readonly gamesService: GamesService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get(ENV.OPENAI_API_KEY),
    });
  }

  async getGamesRecommendations(dto: GameRecommendationsDto): Promise<Game[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a video game recommendation expert. 
            Provide recommendations in JSON format using camelCase property names.
            The response should have a 'gameRecommendations' array property.`,
        },
        {
          role: 'user',
          content: `Based on these games: ${dto.games.join(', ')}, 
          suggest 5 similar games. 
          ${
            dto.existingRecommendations?.length
              ? `DO NOT include these already recommended games: ${dto.existingRecommendations.join(', ')}.`
              : ''
          }
          Return as JSON array of game names.`,
        },
      ],
    });

    const { gameRecommendations } = JSON.parse(response.choices[0].message.content as string);

    const existingCount = dto.existingRecommendations?.length || 0;

    const recommendedGames = [];

    for (const game of gameRecommendations) {
      if (recommendedGames.length + (dto.existingRecommendations?.length || 0) >= 30) {
        break;
      }

      const { games } = await this.gamesApiService.getGamesByName(game);
      recommendedGames.push(...games);
    }

    const startOrder = (dto.existingRecommendations?.length || 0) + 1;

    const totalAllowed = 30 - existingCount;
    return recommendedGames.slice(0, totalAllowed).map((game, index) => ({
      gameApiId: game.id,
      name: game.name,
      coverUrl: game.image.medium_url,
      orderNumber: startOrder + index,
    })) as Game[];
  }
}
