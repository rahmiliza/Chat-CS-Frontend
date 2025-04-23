export interface Response<T = any> {
  data: T;
  ok: boolean;
}
export interface ResponseWithMessage<T = any> {
  data: T;
  status: string;
  message: string;
}

export interface ResponseWithPagination<T = any> {
  data: T;
  pagination: PaginationResponse;
}

export interface PaginationResponse {
  page: number;
  per_page: number;
  total_pages: number;
  next_page_cursor: string | null;
}
