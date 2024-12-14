import { User } from '@/modules/users/entities/user.entity';

import { List } from '../entities/list.entity';

export const SINGLE_LIST_RESPONSE_EXAMPLE_DATA: List = {
  id: 1,
  name: 'Not My Favorite Games',
  description: 'A collection of my all-time favorite video games',
  createdAt: new Date('2023-04-15T09:30:00Z'),
  updatedAt: new Date('2023-05-02T14:45:00Z'),
  user: { id: 1 } as User,
};
