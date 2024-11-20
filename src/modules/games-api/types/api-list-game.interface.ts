export interface ApiListGame {
  deck: string;
  guid: string;
  id: number;
  image: {
    icon_url: string;
    medium_url: string;
    screen_url: string;
    screen_large_url: string;
    small_url: string;
    super_url: string;
    thumb_url: string;
    tiny_url: string;
    original_url: string;
  };
  name: string;
  original_game_rating: {
    id: number;
    name: string;
  }[];
  original_release_date: string;
  platforms: {
    api_detail_url: string;
    id: number;
    name: string;
    site_detail_url: string;
    abbreviation: string;
  }[];
}
