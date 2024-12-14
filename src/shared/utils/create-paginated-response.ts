import { PaginatedResponse } from '@/shared/types/paginated-response.interface';

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    meta: {
      total,
      currentPage: page,
      itemsPerPage: limit,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
}
