import axios, { AxiosResponse } from 'axios';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiListGame } from '../types/api-list-game.interface';
import { ApiPlatform } from '../types/api-platform.interface';
import { ApiSingleGame } from '../types/api-single-game.inteface';
import { GiantBombResponse } from '../types/giantbomb-response.interface';

import { ENV } from 'src/shared/enums/env.enum';

@Injectable()
export class GamesApiService {
  private readonly logger = new Logger(GamesApiService.name);

  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>(ENV.GIANT_BOMB_API_URL) as string;
    this.apiKey = this.configService.get<string>(ENV.GIANT_BOMB_API_KEY) as string;
  }

  async getGamesByName(
    name: string,
    page = 1,
    limit = 10,
    sort?: string,
    year?: number,
    platform?: number,
    genre?: number,
  ): Promise<{ games: ApiListGame[]; total: number }> {
    const url = `${this.apiUrl}/games/`;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        api_key: this.apiKey,
        format: 'json',
        field_list:
          'deck,guid,id,image,name,original_game_rating,original_release_date,platforms,genres',
        limit: limit,
        offset: (page - 1) * limit,
      };

      const filters = [];

      if (name) {
        filters.push(`name:${name}`);
      }

      if (year) {
        const startDate = `${year}-01-01 00:00:00`;
        const endDate = `${year}-12-31 23:59:59`;
        filters.push(`original_release_date:${startDate}|${endDate}`);
      }

      if (platform) {
        filters.push(`platforms:${platform}`);
      }

      if (genre) {
        filters.push(`genres:${genre}`);
      }

      if (filters.length > 0) {
        params.filter = filters.join(',');
      }

      if (sort) {
        const [field, direction] = sort.split(':');
        params.sort = `${field}:${direction || 'asc'}`;
      }

      const response: AxiosResponse<GiantBombResponse<ApiListGame[]>> = await axios.get(url, {
        params,
      });

      return {
        games: response.data.results,
        total: response.data.number_of_total_results,
      };
    } catch (error) {
      this.logger.error('Error fetching games:', error);
      throw error;
    }
  }

  async getGameById(id: string): Promise<ApiSingleGame> {
    const url = `${this.apiUrl}/game/${id}/`;

    try {
      const response: AxiosResponse<GiantBombResponse<ApiSingleGame>> = await axios.get(url, {
        params: {
          api_key: this.apiKey,
          format: 'json',
          field_list:
            'id,guid,name,image,deck,original_game_rating,original_release_date,platforms,genres,similar_games,developers',
        },
      });

      return response.data.results;
    } catch (error) {
      this.logger.error('Error fetching game by ID:', error);
      throw error;
    }
  }

  async getAllPlatforms(): Promise<ApiPlatform[]> {
    const url = `${this.apiUrl}/platforms/`;

    try {
      const response: AxiosResponse<GiantBombResponse<ApiPlatform[]>> = await axios.get(url, {
        params: {
          api_key: this.apiKey,
          format: 'json',
          field_list: 'id,name,abbreviation',
          limit: 100,
        },
      });

      return response.data.results;
    } catch (error) {
      this.logger.error('Error fetching platforms:', error);
      throw error;
    }
  }
}
