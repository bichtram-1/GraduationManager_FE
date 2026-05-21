export interface BaseListParams {
  page: number;
  limit: number;
  keyword?: string;
  sort_by?: string;
  sort_direction?: 'DESC' | 'ASC';
}

export interface Pagination {
  total: number;
  totalPages: number;
  limit: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage: number | null;
  previousPage: number | null;
}
export interface RangeParams {
  start: string | null;
  end: string | null;
}

export interface ListResponseTypeObject<T> {
  total: number;
  rows: T[];
}

export interface ListResponseType<T> {
  code: number;
  results: {
    objects: ListResponseTypeObject<T>;
  };
  pagination: Pagination;
}

export interface DetailResponseType<T> {
  code: number;
  results: {
    object: T;
  };
}

export interface GeneralErrorType<T = unknown> {
  error_id: string;
  message: string;
  metadata?: T;
}

export interface OptionType {
  label: string;
  value: string | number | boolean;
  [key: string]: unknown;
}
