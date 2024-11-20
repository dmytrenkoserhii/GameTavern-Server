import { ApiListGame } from '../types/api-list-game.interface';

export const ALL_API_GAMES_RESPONSE_EXAMPLE_DATA: ApiListGame[] = [
  {
    deck: 'An action-packed adventure game set in a post-apocalyptic world.',
    guid: '3030-1',
    id: 1,
    image: {
      icon_url: 'https://www.example.com/images/game1_icon.jpg',
      medium_url: 'https://www.example.com/images/game1_medium.jpg',
      screen_url: 'https://www.example.com/images/game1_screen.jpg',
      screen_large_url: 'https://www.example.com/images/game1_screen_large.jpg',
      small_url: 'https://www.example.com/images/game1_small.jpg',
      super_url: 'https://www.example.com/images/game1_super.jpg',
      thumb_url: 'https://www.example.com/images/game1_thumb.jpg',
      tiny_url: 'https://www.example.com/images/game1_tiny.jpg',
      original_url: 'https://www.example.com/images/game1_original.jpg',
    },
    name: 'Post-Apocalyptic Adventures',
    original_game_rating: [
      { id: 1, name: 'ESRB: M' },
      { id: 2, name: 'PEGI: 18' },
    ],
    original_release_date: '2023-09-15',
    platforms: [
      {
        api_detail_url: 'https://api.example.com/platforms/1',
        id: 1,
        name: 'PlayStation 5',
        site_detail_url: 'https://www.example.com/platforms/ps5',
        abbreviation: 'PS5',
      },
      {
        api_detail_url: 'https://api.example.com/platforms/2',
        id: 2,
        name: 'Xbox Series X',
        site_detail_url: 'https://www.example.com/platforms/xsx',
        abbreviation: 'XSX',
      },
      {
        api_detail_url: 'https://api.example.com/platforms/3',
        id: 3,
        name: 'PC',
        site_detail_url: 'https://www.example.com/platforms/pc',
        abbreviation: 'PC',
      },
    ],
  },
];
