export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface InstructionFilters {
  status?: string[];
  regionId?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
