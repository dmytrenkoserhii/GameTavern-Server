import { User } from 'src/modules/users/entities/user.entity';

export interface GoogleAuthPayload extends User {
  accessToken: string;
  refreshToken: string;
}
