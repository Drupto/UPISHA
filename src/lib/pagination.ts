/**
 * Pagination utility for API responses
 */

export interface PaginationOptions {
  page?: number
  limit?: number
  maxLimit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export function getPaginationParams(options: PaginationOptions = {}): { page: number; limit: number } {
  const defaultLimit = options.limit || 20
  const maxLimit = options.maxLimit || 100

  const page = Math.max(1, options.page || 1)
  const limit = Math.min(maxLimit, Math.max(1, defaultLimit))

  return { page, limit }
}

export function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const totalCount = items.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const data = items.slice(startIndex, endIndex)

  return {
    data,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}