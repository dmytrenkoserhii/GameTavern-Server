export interface ApiSingleGame {
  id: number;
  guid: string;
  name: string;
  description: string | null;
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
  } | null;
  deck: string | null;
  original_game_rating: {
    id: number;
    name: string;
  } | null;
  original_release_date: Date | null;
  platforms:
    | {
        id: number;
        name: string;
        abbreviation: string;
      }[]
    | null;
  genres:
    | {
        id: number;
        name: string;
      }[]
    | null;
  similar_games:
    | {
        api_detail_url: string;
        id: number;
        name: string;
        site_detail_url: string;
      }[]
    | null;
  developers:
    | {
        api_detail_url: string;
        id: number;
        name: string;
        site_detail_url: string;
      }[]
    | null;
  createdAt: Date;
  updatedAt: Date;
  listId: number;
}
