import { PaginatedResponse } from '@/shared/types/paginated-response.interface';

import { List } from '../entities/list.entity';
import { SINGLE_LIST_RESPONSE_EXAMPLE_DATA } from './single-list-response-example-data.constant';

export const SINGLE_ALL_LISTS_RESPONSE_EXAMPLE_DATA: PaginatedResponse<List> = {
  items: [SINGLE_LIST_RESPONSE_EXAMPLE_DATA],
  meta: {
    total: 1,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    hasNextPage: false,
  },
};
