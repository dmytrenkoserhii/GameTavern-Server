import OpenAI from 'openai';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GamesApiService } from '@/modules/games-api/services/games-api.service';
import { ApiListGame } from '@/modules/games-api/types/api-list-game.interface';
import { ENV } from '@/shared/enums';

import { GameDescriptionDto } from '../dtos/game-description.dto';
import { GameQuestionDto } from '../dtos/game-question.dto';
import { GameRecommendationsDto } from '../dtos/game-recommendations.dto';
import { GetGameInfoResponse } from '../types/get-game-info-response.interface';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly gamesApiService: GamesApiService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get(ENV.OPENAI_API_KEY),
    });
  }

  async getGamesByDescription(gameDescriptionDto: GameDescriptionDto): Promise<ApiListGame[]> {
    const { description } = gameDescriptionDto;

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
          content: `Suggest up to 5 video games that match this description: "${description}".
          Return as JSON array of game names.`,
        },
      ],
    });

    const { gameRecommendations } = JSON.parse(response.choices[0].message.content as string);

    const recommendedGames = [];

    for (const game of gameRecommendations) {
      const { games } = await this.gamesApiService.getGamesByName(game);
      recommendedGames.push(...games);
    }

    return recommendedGames;
  }

  async getListGamesRecommendations(
    gameRecommendationsDto: GameRecommendationsDto,
  ): Promise<ApiListGame[]> {
    const existingRecommendationsMessage = gameRecommendationsDto.existingRecommendations?.length
      ? `DO NOT include these already recommended games: ${gameRecommendationsDto.existingRecommendations.join(', ')}.`
      : '';

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
          content: `Based on these games: ${gameRecommendationsDto.games.join(', ')}, 
          suggest 5 similar games. 
          ${existingRecommendationsMessage}
          Return as JSON array of game names.`,
        },
      ],
    });

    const { gameRecommendations } = JSON.parse(response.choices[0].message.content as string);

    const recommendedGames = [];

    for (const game of gameRecommendations) {
      if (
        recommendedGames.length + (gameRecommendationsDto.existingRecommendations?.length || 0) >=
        30
      ) {
        break;
      }

      const { games } = await this.gamesApiService.getGamesByName(game);
      recommendedGames.push(...games);
    }

    return recommendedGames;
  }

  async getGameInfo(gameQuestionDto: GameQuestionDto): Promise<GetGameInfoResponse> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a video game expert. Provide concise and informative answers about games.',
        },
        {
          role: 'user',
          content: `Return a JSON response with an "answer" field containing information 
          about this game ${gameQuestionDto.gameName} : ${gameQuestionDto.question}`,
        },
      ],
    });

    return JSON.parse(response.choices[0].message.content as string);
  }
}
