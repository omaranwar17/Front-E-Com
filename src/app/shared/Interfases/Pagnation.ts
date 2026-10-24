import { IProduct } from "./IProduct"

export interface IPagnation<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: T[];
}
