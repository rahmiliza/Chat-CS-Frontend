export type Path<T> = (string & keyof T) | `${string & keyof T}.${string}`;
export interface ColumnDefinition<T = any> {
  label: string;
  key: Path<T>;
  expandable?: boolean;

  cellHeaderClass?: string;
  cellHeaderStyle?: string;
  cellClass?: string;
  cellStyle?: string;
}

export interface Pagination {
  page: number;
  totalPages: number;
  perPage: number;
}
