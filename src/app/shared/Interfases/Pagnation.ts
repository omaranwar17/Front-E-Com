import { IProduct } from "./IProduct"

export interface IPagnation {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  data: IProduct[]
}

