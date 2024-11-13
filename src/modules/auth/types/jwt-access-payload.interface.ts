import { Role } from 'src/modules/users/enums/role.enum';

export interface JwtAccessPayload {
  sub: number;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  iat: number;
  exp: number;
}
