import { User } from '@/modules/users/entities/user.entity';

export interface GoogleAuthPayload extends User {
  accessToken: string;
  refreshToken: string;
}
